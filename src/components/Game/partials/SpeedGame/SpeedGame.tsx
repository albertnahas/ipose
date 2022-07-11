import { FC } from "react"

import { Divider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Round } from "../../../Round/Round"
import { User } from "../../../../types/user"
import { Challenge } from "../../../../types/challenge"

export const SpeedGame: FC<Props> = ({
  accuracy,
  turn,
  challenge,
  showAnswer,
  pose,
  choices,
  onAnswer,
  hintsLeft,
}) => {
  return (
    <>
      {pose && challenge?.status !== "finished" && (
        <Box sx={{ my: 2 }}>
          <Round
            pose={pose}
            choices={choices}
            onAnswer={onAnswer}
            hintsLeft={hintsLeft}
          />
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        {showAnswer && (
          <>
            <Typography color="text.secondary" variant="body1">
              Correct answers: {accuracy} of {turn}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Box>

      {turn >= (challenge?.rounds || 10) && (
        <Box aria-label="done message" sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary.light">
            Done!
          </Typography>
        </Box>
      )}
    </>
  )
}

interface Props {
  accuracy: number
  turn: number
  user?: User | null
  challenge?: Challenge | null
  showAnswer: boolean
  pose: any
  choices?: any[]
  onAnswer: (answer: any) => void
  hintsLeft: number
}
