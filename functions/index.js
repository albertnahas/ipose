const functions = require("firebase-functions")
const admin = require("firebase-admin")
admin.initializeApp()
admin.firestore().settings({ ignoreUndefinedProperties: true })
const cors = require("cors")({ origin: true });

const avatarURL = "https://avatars.dicebear.com/api/identicon/"

const seedRange = 999999

// Listens for challenge creation
exports.challengeCreated = functions.firestore
    .document("/challenges/{id}")
    .onCreate(async (snap) => {
        functions.logger.log("challenge created ...")
        snap.ref.set(
            { seed: Math.round(Math.random() * seedRange) },
            { merge: true }
        )
        return true
    })

// Listens for requests creation
exports.requestCreated = functions.runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
}).firestore
    .document("/requests/{id}")
    .onCreate(async (snap) => {
        const requestData = snap.data()
        const size = requestData.players
        functions.logger.log("request size", size)

        if (requestData.rematchId) {
            const challengeId = requestData.rematchId
            admin
                .firestore()
                .collection("challenges")
                .doc(challengeId)
                .set(
                    {
                        rematchRequested: true,
                    },
                    { merge: true }
                )
        }

        admin
            .firestore()
            .collection("requests")
            .where("players", "==", size)
            .where("level", "==", requestData.level)
            .where("waiting", "==", true)
            .where("rematchId", "==", requestData.rematchId)
            .orderBy("createdAt", "asc")
            .limit(size)
            .get()
            .then((snapshot) => {
                functions.logger.log("checking for request ...", snap.id, "and found", snapshot.size)
                if (snapshot.size >= size) {
                    delete requestData.waiting
                    delete requestData.rematchRequested
                    delete requestData.id
                    delete requestData.uid

                    const requestsDocs = snapshot.docs.slice(0, size);
                    const cId = requestsDocs[0].id
                    admin
                        .firestore()
                        .collection("challenges")
                        .doc(cId)
                        .set(
                            Object.assign({}, requestData, {
                                status: "started",
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            })
                        )
                        .then(function () {
                            const batch = admin.firestore().batch()
                            requestsDocs.forEach((doc) => {
                                batch.update(doc.ref, "challengeId", cId)
                                batch.update(doc.ref, "waiting", false)
                                if (doc.data().bot) {
                                    createBot(Object.assign({}, doc.data(), {
                                        challengeId: cId
                                    }))
                                }
                            })
                            functions.logger.log("writing challenge with ...", cId)
                            return batch.commit()
                        })
                        .catch((e) => {
                            console.log(e)
                        })
                }
            })

        return true
    })

const createBot = (bot) => {
    const botId = Date.now().toString()
    const botName = Math.random().toString(36).substring(2, 7);
    admin
        .firestore()
        .collection("bots")
        .doc(botId)
        .set(
            Object.assign({}, bot, {
                id: botId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                displayName: `guest_${botName}`,
                photoURL: `${avatarURL}${Math.round(Math.random() * 99999)}.svg`,
            })
        )
}

// Listens for bot creation
exports.botCreated = functions.firestore
    .document("/bots/{id}")
    .onCreate(async (snap) => {
        functions.logger.log("bot created ...")
        const botData = snap.data()
        if (!botData.challengeId) {
            return
        }

        admin
            .firestore()
            .collection(`challenges/${botData.challengeId}/players`)
            .add(
                {
                    id: botData.uid,
                    displayName: botData.displayName,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    timedScore: 0,
                    accuracy: 0,
                    hintsUsed: 0,
                    turn: 1,
                }
            ).then(async (docRef) => {
                let timedScore = 0, accuracy = 0;
                for (let i = 1; i <= botData.rounds; i++) {
                    const time = randomFrom(500, 15000)
                    await timeout(time)
                    functions.logger.log("bot next turn ...", i)
                    const isCorrect = Math.random() < 0.5
                    const withHint = Math.random() < 0.5

                    timedScore += isCorrect
                        ? timedScore +
                        Math.round((10 * 10) / (time / 1000)) /
                        (Number(withHint) + 1) : timedScore
                    accuracy = accuracy + Number(isCorrect)
                    docRef.set({ turn: i, accuracy, timedScore }, { merge: true })
                }
            })
        return true
    })

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Listens for player creation
exports.playerCreated = functions.firestore
    .document("/challenges/{id}/players/{playerId}")
    .onCreate(async (snap, context) => {
        const challengeId = context.params.id
        updateChallengeFull(challengeId)
        return true
    })

// Listens for player deletion
exports.playerRemoved = functions.firestore
    .document("/challenges/{id}/players/{playerId}")
    .onDelete(async (snap, context) => {
        const challengeId = context.params.id
        const playerId = context.params.playerId

        // remove all rematch requests
        admin.firestore()
            .collection("requests")
            .where("rematchId", "==", challengeId)
            .get()
            .then((snapshot) => {
                if (snapshot.size > 0) {
                    const removeRequestsBatch = admin.firestore().batch()
                    snapshot.docs.forEach((doc) => {
                        removeRequestsBatch.delete(doc.ref)
                    })
                    return removeRequestsBatch.commit()
                }
            })

        // remove all bots
        const removeBotsBatch = admin.firestore().batch()
        admin
            .firestore()
            .collectionGroup("bots")
            .where("uid", "==", playerId)
            .get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    removeBotsBatch.delete(doc.ref)
                })
                return removeBotsBatch.commit()
            })

        const playersSnap = await admin
            .firestore()
            .collection(`challenges/${challengeId}/players`)
            .get()
        if (playersSnap.size == 0) {
            // remove challenge with 0 players
            return admin
                .firestore()
                .collection("challenges")
                .doc(challengeId)
                .delete()
        } else {
            // turn off rematch request after player left
            admin
                .firestore()
                .collection("challenges")
                .doc(challengeId)
                .set(
                    {
                        rematchRequested: false,
                    },
                    { merge: true }
                )
        }
        return true
    })

exports.checkChallengeStatus = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const challengeId = req.query.challengeId || req.body.data.challengeId;
        if (!challengeId) {
            res.status(500).send("No challenge id");
        }
        const challenge = await admin
            .firestore()
            .collection("challenges")
            .doc(challengeId)
            .get()

        if (!challenge.exists) {
            res.status(500).send("Invalid challenge id");
        }
        const result = updateChallengeStatus(challenge)
        res.json({ data: result });

    })
})

const updateChallengeStatus = async (challenge) => {
    const rounds = challenge.data().rounds
    const unfinishedPlayersSnap = await admin
        .firestore()
        .collection(`challenges/${challenge.id}/players`)
        .where("turn", "!=", rounds)
        .get()

    if (unfinishedPlayersSnap.size === 0) {
        const update = { status: "finished" }
        challenge.ref.set(update, { merge: true })
        return Object.assign(challenge.data(), update)
    } else {
        return challenge.data()
    }
}

exports.onUserStatusChanged = functions.database
    .ref("/status/{uid}")
    .onUpdate(async (change, context) => {
        // Get the data written to Realtime Database
        const eventStatus = change.after.val()
        const uid = context.params.uid
        // Then use other event data to create a reference to the
        // corresponding Firestore document.
        const userStatusFirestoreRef = admin.firestore().doc(`users/${uid}`)

        const statusSnapshot = await change.after.ref.once("value")
        const status = statusSnapshot.val()

        // Otherwise, we convert the last_changed field to a Date
        eventStatus.last_changed = new Date(eventStatus.last_changed)
        functions.logger.log(eventStatus)
        userStatusFirestoreRef.set({ status }, { merge: true }).then(() => {
            if (status === "offline") {
                const removePLayersBatch = admin.firestore().batch()
                const removeRequestsBatch = admin.firestore().batch()
                admin
                    .firestore()
                    .collectionGroup("players")
                    .where("id", "==", uid)
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            removePLayersBatch.delete(doc.ref)
                        })
                        return removePLayersBatch.commit()
                    })
                admin
                    .firestore()
                    .collection("requests")
                    .where("uid", "==", uid)
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            removeRequestsBatch.delete(doc.ref)
                        })
                        return removeRequestsBatch.commit()
                    })
            }
        })
    })


const updateChallengeFull = async (challengeId) => {
    const playersSnap = await admin
        .firestore()
        .collection(`challenges/${challengeId}/players`)
        .get()
    const challengeQuery = admin
        .firestore()
        .collection("challenges")
        .doc(challengeId)
    const challenge = await challengeQuery.get()
    const players = challenge.data().players
    return admin
        .firestore()
        .collection("challenges")
        .doc(challengeId)
        .set(
            {
                activePlayers: playersSnap.size,
                full: players == playersSnap.size,
            },
            { merge: true }
        )
}


const randomFrom = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


exports.scheduledStreakCalculate = functions.pubsub.schedule("0 00 * * *")
    .onRun(() => {
        const date = new Date();
        const pastDate = date.getDate() - 1;
        date.setDate(pastDate);

        const notPlayedUsersSnap = admin.firestore().collection("users")
            .where("streak", ">", 0)
            .where("lastPlayedAt", "<", admin.firestore.Timestamp.fromDate(date));

        notPlayedUsersSnap.get().then((snapshot) => {
            const batch = admin.firestore().batch();
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, "streak", 0);
            });
            return batch.commit();
        });

        return null;
    });