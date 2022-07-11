/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Challenge, ChallengeSetup } from "../types/challenge"
import { ChallengeState, State } from "../types/state"

const initialState: ChallengeState = { value: null, setup: null }

export const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    setChallenge: (
      state: ChallengeState,
      action: PayloadAction<Challenge | null>
    ) => {
      state.value = action.payload
    },
    setChallengeSetup: (
      state: ChallengeState,
      action: PayloadAction<ChallengeSetup | null>
    ) => {
      state.setup = action.payload
      state.value = null
    },
  },
})
export const challengeSelector = (state: State) => state.challenge?.value
export const challengeSetupSelector = (state: State) => state.challenge?.setup

// Action creators are generated for each case reducer function
export const { setChallenge, setChallengeSetup } = challengeSlice.actions

export default challengeSlice.reducer
