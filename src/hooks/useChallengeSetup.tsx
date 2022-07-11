import React, { useEffect, useRef } from "react"
import firebase from "../config"
import { Challenge, ChallengeSetup } from "../types/challenge"
import { useSelector } from "react-redux"
import { userSelector } from "../store/userSlice"

export enum PairingStatus {
  STALE = "STALE",
  PAIRING = "PAIRING",
  CANCELLED = "CANCELLED",
}

export const useChallengeSetup = () => {
  const [challenge, setChallenge] = React.useState<Challenge>()
  const [pairing, setPairing] = React.useState<PairingStatus>(
    PairingStatus.STALE
  )
  const pairingRef = React.useRef<PairingStatus>(PairingStatus.STALE)

  const requrest = useRef()
  const requrestSubscribe = useRef<any>()

  const user = useSelector(userSelector)

  const timeout = 20 * 1000

  useEffect(() => {
    pairingRef.current = pairing
  }, [pairing])

  const createChallenge = (setup?: ChallengeSetup) => {
    firebase
      .firestore()
      .collection("challenges")
      .add({
        uid: user?.uid || null,
        ...setup,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function (docRef: any) {
        console.log("Document written with ID: ", docRef.id)
        setChallenge({ id: docRef.id, ...setup })
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  const requestChallenge = (setup?: ChallengeSetup) => {
    firebase
      .firestore()
      .collection("requests")
      .add({
        uid: user?.uid || null,
        ...setup,
        waiting: true,
        rematchId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function (docRef: any) {
        setPairing(PairingStatus.PAIRING)
        checkAvailability(setup)
        console.log("Document written with ID: ", docRef.id)
        requrest.current = docRef.id
        requrestSubscribe.current = docRef.onSnapshot((querySnapshot: any) => {
          if (!querySnapshot.exists) {
            return
          }
          const requestData = querySnapshot.data()
          if (requestData.challengeId) {
            console.log("Document written with ID: ", requestData.challengeId)
            setPairing(PairingStatus.STALE)
            setChallenge({ id: requestData.challengeId, ...setup })
            requrestSubscribe.current?.()
          }
        })
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  const checkAvailability = (setup?: ChallengeSetup) => {
    setTimeout(() => {
      if (pairingRef.current === PairingStatus.PAIRING) {
        if (setup?.variation === "standard") {
          requestBot(setup)
        } else {
          setPairing(PairingStatus.CANCELLED)
          requrestSubscribe.current?.()
        }
        checkAvailability(setup)
      }
    }, timeout)
  }

  const requestBot = (setup?: ChallengeSetup) => {
    firebase
      .firestore()
      .collection("requests")
      .add({
        uid: user?.uid || null,
        ...setup,
        waiting: true,
        bot: true,
        rematchId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
  }

  const cancelRequest = () => {
    if (requrest.current) {
      firebase
        .firestore()
        .collection("requests")
        .doc(requrest.current)
        .delete()
        .then(() => {
          setPairing(PairingStatus.STALE)
          requrestSubscribe.current?.()
        })
    }
  }

  return {
    challenge,
    pairing,
    createChallenge,
    requestChallenge,
    cancelRequest,
  }
}
