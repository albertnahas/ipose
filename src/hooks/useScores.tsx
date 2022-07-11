import { useSelector } from "react-redux"
import firebase from "../config"
import { challengeSelector } from "../store/challengeSlice"
import { userSelector } from "../store/userSlice"
import { Challenge } from "../types/challenge"

export const useScores = () => {
  const user = useSelector(userSelector)
  const challenge = useSelector(challengeSelector)
  const functions = firebase.functions()

  const writeSpeedScore = (
    timedScore: number,
    accuracy: number,
    next: boolean,
    answered: boolean,
    hintsUsed: number
  ) => {
    if (!user || !challenge) {
      return new Promise((resolve, reject) => reject(false))
    }
    const challengeId = challenge.id
    return firebase
      .firestore()
      .collection(`challenges/${challengeId}/players`)
      .doc(user.uid)
      .set({
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        timedScore,
        accuracy,
        hintsUsed,
        turn: challenge.turn || 1,
      })
      .then(() => {
        let turn = challenge.turn || 1
        let roundAnswers = challenge.roundAnswers || 0
        if (next) {
          turn += 1
          roundAnswers = 0
        } else if (answered) {
          roundAnswers++
        }
        if (turn <= (challenge?.rounds || 10)) {
          return firebase
            .firestore()
            .collection(`challenges`)
            .doc(challengeId)
            .set(
              {
                turn,
                roundAnswers,
              },
              { merge: true }
            )
        } else {
          return checkChallengeStatus()
        }
      })
  }

  const writeScore = (
    timedScore: number,
    accuracy: number,
    turn: number,
    hintsUsed: number
  ) => {
    if (!user || !challenge) {
      return
    }
    const challengeId = challenge.id
    return firebase
      .firestore()
      .collection(`challenges/${challengeId}/players`)
      .doc(user.uid)
      .set({
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        timedScore,
        accuracy,
        hintsUsed,
        turn,
      })
      .then(() => {
        if (turn === challenge?.rounds) {
          return checkChallengeStatus()
        } else {
          return new Promise((resolve, reject) => resolve(true))
        }
      })
  }

  const checkChallengeStatus = () => {
    if (!challenge) return
    const challengeId = challenge?.id

    const checkChallengeStatusCallable = functions.httpsCallable(
      "checkChallengeStatus"
    )
    return checkChallengeStatusCallable({ challengeId: challengeId })
      .then((res: { data: Challenge }) => {
        return new Promise<{ data: Challenge }>((resolve, reject) => {
          resolve(res)
        })
      })
      .catch((err) => {})
  }
  return { writeScore, writeSpeedScore }
}
