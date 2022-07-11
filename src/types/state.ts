import { Challenge, ChallengeSetup } from "./challenge"
import { User } from "./user"

export interface State {
  user: UserState
  challenge: ChallengeState
  alert: AlertState
  drawer: DrawerState
  loginModal: LoginModalState
  feedback: FeedbackState
  snackbar: SnackbarState
}

export interface UserState {
  value?: User | null
  serverValue?: any | null
}
export interface ChallengeState {
  value?: Challenge | null
  setup?: ChallengeSetup | null
}
export interface AlertState {
  title?: string
  message?: string
  open?: boolean
}
export interface DrawerState {
  open?: boolean
}
export interface LoginModalState {
  open?: boolean
}
export interface SnackbarState {
  open?: boolean
  message?: string
  type?: "success" | "warning" | "error"
  duration?: number
  cta?: JSX.Element
}
export interface FeedbackState {
  open?: boolean
}
