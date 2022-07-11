import { Position } from "../../types/position"

export const startingTurn = 1

export enum GameActionType {
  ANSWER = "ANSWER",
  SUBMIT = "SUBMIT",
  NEXT = "NEXT",
}
interface GameState {
  turn: number
  hintsUsed: number
  timedScore: number
  accuracy: number
  answered: boolean
  submitted: boolean
  correct: boolean
  positions: Position[]
}

export const initialGameState: GameState = {
  turn: startingTurn,
  answered: false,
  submitted: false,
  correct: false,
  timedScore: 0,
  accuracy: 0,
  hintsUsed: 0,
  positions: [],
}

type GameAction =
  | {
      type: GameActionType.ANSWER
      payload: {
        isCorrect: boolean
        withHint: boolean
        time: number
        position: Position
      }
    }
  | { type: GameActionType.SUBMIT }
  | { type: GameActionType.NEXT }

export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  switch (action.type) {
    case GameActionType.ANSWER:
      return {
        ...state,
        answered: true,
        submitted: false,
        correct: action.payload.isCorrect,
        accuracy: state.accuracy + Number(action.payload.isCorrect),
        hintsUsed: state.hintsUsed + Number(action.payload.withHint),
        timedScore: action.payload.isCorrect
          ? state.timedScore +
            Math.round((10 * 10) / (action.payload.time || 10)) /
              (Number(action.payload.withHint) + 1)
          : state.timedScore,
        positions: action.payload.isCorrect
          ? [...state.positions, action.payload.position]
          : state.positions,
      }
    case GameActionType.NEXT:
      return { ...state, turn: state.turn + 1, answered: false, correct: false }
    case GameActionType.SUBMIT:
      return { ...state, submitted: true }
    default:
      return state
  }
}
