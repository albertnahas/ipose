import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from "react"
import _ from "lodash"
import {
  generatePoseChoices,
  getLevelLabel,
  getRandomFromSeed,
} from "../../../../utils/helpers"
import { SpeedGame } from "./SpeedGame"
import { maxHints } from "../../../../utils/constants"
import { useSelector } from "react-redux"
import { userSelector } from "../../../../store/userSlice"
import { challengeSelector } from "../../../../store/challengeSlice"
import { useScores } from "../../../../hooks/useScores"
import { Position } from "../../../../types/position"
import {
  GameActionType,
  gameReducer,
  initialGameState,
  startingTurn,
} from "../../GameReducer"
import allPositions from "../../../../data/positions.json"

export const SpeedGameContainer: FC<Props> = ({
  display,
  players,
  onComplete,
}) => {
  const [pose, setPose] = useState<any>()

  const [
    {
      turn,
      hintsUsed,
      timedScore,
      accuracy,
      answered,
      correct,
      submitted,
      positions,
    },
    dispatch,
  ] = useReducer(gameReducer, {
    ...initialGameState,
  })

  const user = useSelector(userSelector)
  const challenge = useSelector(challengeSelector)
  const { writeSpeedScore } = useScores()

  const levelPoses = useMemo<Position[]>(
    () =>
      allPositions.filter((p) =>
        p.tags
          ?.find((t) => t.key === "Complexity")
          ?.values.includes(
            getLevelLabel(challenge?.level || 1).toLocaleLowerCase()
          )
      ),
    [challenge]
  )

  const choices = useMemo<any[]>(() => {
    return generatePoseChoices(levelPoses, pose)
  }, [pose, levelPoses])

  useLayoutEffect(() => {
    if (!challenge || pose) return
    if (challenge.id && challenge.seed) {
      const random = Math.floor(
        getRandomFromSeed((challenge.seed || 0) + turn) * levelPoses.length
      )
      const randomPose = levelPoses[random]
      setPose(randomPose)
    } else {
      const randomPose = _.sample(levelPoses)
      setPose(randomPose)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose, challenge])

  const onAnswer = useCallback(
    (answer: any, time?: number, showHint?: boolean) => {
      dispatch({
        type: GameActionType.ANSWER,
        payload: {
          isCorrect: answer && answer.code1 === pose.code1,
          time: time || 1,
          withHint: showHint || false,
          position: pose,
        },
      })
    },
    [pose]
  )

  useEffect(() => {
    if (challenge && answered && turn === challenge.rounds) {
      const posesNames = positions.map((l) => l.name)
      onComplete?.(turn, accuracy, timedScore, posesNames)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, turn])

  useEffect(() => {
    if (
      !challenge ||
      !challenge.id ||
      !user ||
      (!answered && turn !== startingTurn) ||
      submitted
    ) {
      return
    }

    const next =
      correct ||
      (challenge.roundAnswers &&
        challenge.roundAnswers === (players?.length || 1) - 1) ||
      false
    writeSpeedScore(timedScore, accuracy, next, answered, hintsUsed)
    dispatch({
      type: GameActionType.SUBMIT,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    turn,
    answered,
    correct,
    submitted,
    timedScore,
    accuracy,
    challenge,
  ])

  useEffect(() => {
    if (challenge?.turn && challenge?.turn > turn) {
      handleNext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.turn])

  const handleNext = () => {
    setPose(null)
    dispatch({
      type: GameActionType.NEXT,
    })
  }

  return display ? (
    <SpeedGame
      accuracy={accuracy}
      turn={turn}
      user={user}
      challenge={challenge}
      showAnswer={answered}
      pose={pose}
      choices={choices}
      onAnswer={onAnswer}
      hintsLeft={maxHints - hintsUsed}
    />
  ) : (
    <></>
  )
}
interface Props {
  display?: boolean
  players?: any[]
  onComplete?: (
    turn?: number,
    accuracy?: number,
    score?: number,
    positions?: string[]
  ) => void
}
