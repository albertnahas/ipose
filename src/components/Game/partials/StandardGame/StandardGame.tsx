import { FC } from "react"

import { Button, Divider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Round } from "../../../Round/Round"
import { User } from "../../../../types/user"
import { Challenge } from "../../../../types/challenge"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"

export const StandardGame: FC<Props> = ({
  timedScore,
  accuracy,
  turn,
  challenge,
  showAnswer,
  pose,
  choices,
  onClickNext,
  onAnswer,
  hintsLeft,
}) => {
  return (
    <>
      {pose && (
        <Box sx={{ my: 1 }}>
          <Round
            pose={pose}
            choices={choices}
            onAnswer={onAnswer}
            hintsLeft={hintsLeft}
          />
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

      {showAnswer && (
        <>
          {turn < (challenge?.rounds || 10) && (
            <Button
              variant="contained"
              sx={{ mt: 1, mb: 2 }}
              onClick={onClickNext}
              aria-label="next"
              endIcon={<NavigateNextIcon />}
            >
              Next
            </Button>
          )}
          {turn >= (challenge?.rounds || 10) && (
            <Box aria-label="done message" sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary.light">
                Done!
              </Typography>
            </Box>
          )}
        </>
      )}
    </>
  )
}

interface Props {
  timedScore: number
  accuracy: number
  turn: number
  user?: User | null
  challenge?: Challenge | null
  onClickNext: () => void
  showAnswer: boolean
  pose: any
  choices?: any[]
  onAnswer: (answer: any) => void
  hintsLeft: number
}
