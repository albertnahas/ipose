import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Button, Container, Paper, Typography } from "@mui/material"
import { Box, styled } from "@mui/system"
import { Timer } from "../../atoms/Timer/Timer"
import { HintButton } from "../../atoms/HintButton/HintButton"
import {
  maxHints,
  roundTimeout,
  maxAudioLoadingAttempts,
} from "../../utils/constants"
import { Repeat } from "@mui/icons-material"
import { Position } from "../../types/position"
import { PositionInfo } from "../../molecules/PositionInfo/PositionInfo"

export const BoxContainer = styled("div")`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const RoundContainer = styled(Paper)(
  ({ theme }) => `
  padding: ${theme.spacing(3)};
  border-radius: 10px;
`
)

export const Round: FC<Props> = ({ pose, choices, onAnswer, hintsLeft }) => {
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [answer, setAnswer] = useState<any>()
  const [time, setTime] = useState(0)
  const [active, setActive] = useState<boolean>(true)
  const [errorAttempts, setErrorAttempts] = useState<number>(0)

  const hint = useMemo<string>(() => {
    if (!pose) return ""

    const hidePoseName = (l: string) => l.replaceAll(pose.name, "***")
    const split = pose.description.split(".")
    const hintMsg =
      split.length > 1
        ? hidePoseName(split[1])
        : (split[0] && hidePoseName(split[0])) || ""

    return `${hintMsg}.`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose])

  useEffect(() => {
    if (!answer) return
    onAnswer(answer, time, showHint)
    setShowHint(false)
    setActive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer])

  const onTimerChange = useCallback((t: number) => {
    setTime(t)
    if (t === roundTimeout) {
      setActive(false)
      setAnswer(" ")
    }
  }, [])

  const onError = (e: string) => {
    setErrorAttempts((errorAttempts) => errorAttempts + 1)
    if (errorAttempts < maxAudioLoadingAttempts) {
      return true
    } else {
      return false
    }
  }

  const hintsText = `${hintsLeft - 1 !== 0 ? hintsLeft - 1 : "no"} ${
    hintsLeft - 1 === 1 ? "hint" : "hints"
  }`

  const renderChoices = () =>
    choices?.map(
      (c) =>
        c && (
          <Button
            key={c.name}
            variant="outlined"
            aria-label={`${c}-choice`}
            sx={{ m: 1 }}
            onClick={() => setAnswer(c)}
          >
            {c.name}
          </Button>
        )
    )

  const timeColor =
    time >= 25
      ? "error.light"
      : time >= 20
      ? "warning.light"
      : "secondary.light"

  return (
    <Container sx={{ p: 2 }} aria-label="round container">
      <RoundContainer elevation={24}>
        <Box sx={{ mb: 2 }}>
          {time !== roundTimeout && (
            <Typography
              color={timeColor}
              variant="h2"
              sx={{ textAlign: "center" }}
            >
              <Timer onTimeChange={onTimerChange} active={active} />
            </Typography>
          )}
          {time === roundTimeout && (
            <Typography
              color="error.light"
              variant="h6"
              sx={{ textAlign: "center" }}
            >
              Oops... The time is up!
            </Typography>
          )}
          <Typography
            color="secondary.light"
            variant="body2"
            sx={{ textAlign: "center" }}
          >
            {/* round maximum score: {Math.round(100 / (time || 1))} */}
          </Typography>
        </Box>
        <BoxContainer>
          <Box sx={{ width: { xs: "90%", md: "40%" }, margin: "auto" }}>
            <img style={{ width: "100%" }} src={pose.img} alt="position" />
          </Box>
          {!answer && active && (
            <HintButton
              disabled={hintsLeft === 0 || showHint}
              onClick={() => setShowHint(true)}
              hintsLeft={hintsLeft}
            />
          )}
        </BoxContainer>
        {errorAttempts >= maxAudioLoadingAttempts && (
          <Button
            variant="text"
            color="error"
            sx={{ my: 1 }}
            onClick={() => onError("")}
            aria-label="retry"
            endIcon={<Repeat />}
          >
            Retry
          </Button>
        )}
        {choices && !answer && (
          <Box aria-label="choices">{renderChoices()}</Box>
        )}
        {pose && showHint && (
          <Alert sx={{ mt: 2, textAlign: "left" }} severity="info">
            <Typography sx={{ mb: 1 }} variant="body2">
              {hint}
            </Typography>
            <Typography
              sx={{ fontWeight: 500 }}
              color="primary.light"
              variant="caption"
            >
              Using hints is limited to {maxHints} per game and deducts your
              round score by half. You have {hintsText} available.
            </Typography>
          </Alert>
        )}
        {answer && (
          <>
            <Alert
              severity={answer.name === pose.name ? "success" : "error"}
              aria-label="result"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowInfo((si) => !si)}
                >
                  Learn more
                </Button>
              }
            >
              {pose.name}
            </Alert>
            {pose && showInfo && (
              <PositionInfo name={pose.name} info={pose.description} />
            )}
          </>
        )}
      </RoundContainer>
    </Container>
  )
}

interface Props {
  pose: Position
  choices?: any[]
  onAnswer: (answer: any, time?: number, showHint?: boolean) => void
  hintsLeft: number
}
