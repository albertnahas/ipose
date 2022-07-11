import firebase from "../config"

export type ChallengeStatus = "pending" | "started" | "finished" | "aborted"

export const challengeVariations = ["standard", "speed"] as const
export type ChallengeVariation = typeof challengeVariations[number]

export interface Challenge {
  id?: string
  uid?: string
  level?: number
  variation?: ChallengeVariation
  rounds?: number
  seed?: number
  status?: ChallengeStatus
  createdAt?: firebase.firestore.Timestamp
  finishedAt?: firebase.firestore.Timestamp
  scores?: object
  players?: number
  live?: boolean
  full?: boolean
  rematchRequested?: boolean

  turn?: number
  roundAnswers?: number
}

export interface Player {
  id?: string
  displayName: string
  photoURL: string
  joinedAt: firebase.firestore.Timestamp
  timedScore: number
  accuracy: number
  turn: number
  roundsScore: RoundScore[]
}

export interface RoundScore {
  turn?: number
  correct?: boolean
  time?: number
}

export interface ChallengeSetup {
  players?: number
  level?: number
  rounds?: number
  live?: boolean
  variation?: ChallengeVariation
}
