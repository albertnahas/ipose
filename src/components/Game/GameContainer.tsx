import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  challengeSelector,
  challengeSetupSelector,
} from "../../store/challengeSlice"
import { userSelector } from "../../store/userSlice"
import { Game, GameStatus } from "./Game"
import { useChallenge } from "../../hooks/useChallenge"
import { ConfirmDialog } from "../../molecules/ConfirmDialog/ConfirmDialog"
import { useUser } from "../../hooks/useUser"
import { setFeedback } from "../../store/feedbackSlice"
import firebase from "../../config"
import { isToday } from "../../utils/utils"
import { UserStats } from "../../types/user"
import { getLv } from "../../utils/helpers"
import { setSnackbar } from "../../store/snackbarSlice"
import { useAnalytics } from "../../hooks/useAnalytics"

export const GameContainer = () => {
  const [open, setOpen] = useState(false)
  const [waitingOthers, setWaitingOthers] = useState(false)
  const { logEvent } = useAnalytics()

  let { gameId } = useParams()

  const {
    players,
    error,
    leaveChallenge,
    completeChallenge,
    rematch,
    requestRematch,
    cancelRematch,
    playAgain,
  } = useChallenge(gameId)

  const { updateUser } = useUser()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = useSelector(userSelector)
  const challenge = useSelector(challengeSelector)
  const challengeSetup = useSelector(challengeSetupSelector)

  const isGameDone = useMemo(
    () =>
      (players &&
        challenge &&
        challenge.id &&
        players.every((p) => p.turn >= (challenge.rounds || 10))) ||
      (challenge && challenge.status === "finished") ||
      false,
    [players, challenge]
  )

  const isMultiPlayer = useMemo<Boolean>(
    () => !!players && players.length > 1,
    [players]
  )

  const gameStatus = useMemo<GameStatus>(() => {
    if (isGameDone) return "finished"
    if (error) return "error"
    if (waitingOthers) return "waiting_others"
    if (!challenge || !challenge.id || challenge.full) return "started"
    if (challenge && challenge.id && !challenge.full) return "waiting"
    return "loading"
  }, [challenge, error, waitingOthers, isGameDone])

  useLayoutEffect(() => {
    if ((challenge || !challengeSetup) && !gameId && !challenge?.level) {
      navigate("/")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, challenge])

  const onLeaveConfirmed = useCallback(() => {
    if (rematch) {
      cancelRematch()
    }
    leaveChallenge()
    navigate("/")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelRematch, leaveChallenge, rematch])

  const onClickLeave = useCallback(() => {
    if (players && players.length > 1 && challenge && !isGameDone) {
      setOpen(true)
    } else {
      onLeaveConfirmed()
    }
  }, [challenge, isGameDone, onLeaveConfirmed, players])

  const onComplete = useCallback(
    (
      turn?: number,
      accuracy?: number,
      score?: number,
      positions?: string[]
    ) => {
      if (!user?.feedback) {
        setTimeout(() => {
          dispatch(setFeedback(true))
        }, 1500)
      }

      const gamesPlayed = user?.gamesPlayed || 0
      const roundsPlayed = user?.roundsPlayed || 0
      const accRatio = (accuracy || 0) / (turn || 1)
      const prevAccuracy = user?.accuracy || 0
      const userAccuracy = prevAccuracy
        ? (prevAccuracy * gamesPlayed + (accRatio || 0)) / (gamesPlayed + 1)
        : accRatio || 0
      const xp = (user?.xp || 0) + (score || 0) * (challenge?.level || 0)
      const lifeScore =
        (user?.lifeScore || 0) +
        Math.round(Math.pow(score || 0, 2) / (user?.lifeScore || score || 1))
      const newPositions = user?.positions
        ? Array.from(new Set([...user.positions, ...(positions || [])]))
        : positions || []

      let streak = user?.streak || 0
      let streakUpdated = false

      if (
        !user?.lastStreakUpdateAt ||
        !isToday(user?.lastStreakUpdateAt.toDate())
      ) {
        streak++
        streakUpdated = true
      }

      const history = user?.history || []
      const newStats: UserStats = {
        gamesPlayed: gamesPlayed + 1,
        roundsPlayed: roundsPlayed + (turn || 0),
        accuracy: Math.round(userAccuracy * 100) / 100,
        xp,
        lifeScore,
        streak,
        positions: newPositions,
      }

      const historyRecord: UserStats = {
        ...newStats,
        roundsPlayed: turn || 0,
        accuracy: accRatio,
        xp: score || 0,
        level: challenge?.level || 1,
        positions,
      }

      const currDate =
        firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp
      const currLv = getLv(user?.xp).lv
      updateUser({
        ...user,
        lastPlayedAt: currDate,
        lastStreakUpdateAt: streakUpdated ? currDate : user?.lastStreakUpdateAt,
        ...newStats,
        history: [
          ...history,
          {
            ...historyRecord,
            statDate: new Date(),
          },
        ],
      }).then(() => {
        if (!isMultiPlayer) {
          completeChallenge()
        } else {
          setWaitingOthers(true)
        }
        const newLv = getLv(xp).lv
        if (newLv > currLv) {
          dispatch(
            setSnackbar({
              message: `You have reached level ${newLv}!`,
              type: "success",
              open: true,
              cta: <Link to="/profile">check your profile!</Link>,
              duration: 5000,
            })
          )
        }

        // let accuracyMessage = ""
        // let drop = false
        // const accDiff = Math.abs(Math.round((prevAccuracy - userAccuracy) * 100))
        // if (userAccuracy > prevAccuracy) {
        //   accuracyMessage = `You have improved your accuracy by ${accDiff}%!`
        // } else {
        //   accuracyMessage = `Your accuracy has dropped by ${accDiff}%!`
        //   drop = true
        // }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [challenge?.level, isMultiPlayer, user]
  )

  useEffect(() => {
    logEvent("new_game", { userId: user?.uid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Game
        user={user}
        challenge={challenge || undefined}
        players={players}
        gameStatus={gameStatus}
        onClickLeave={onClickLeave}
        onClickRematch={requestRematch}
        onClickPlayAgain={playAgain}
        onComplete={onComplete}
        rematch={rematch}
        error={error}
      />
      <ConfirmDialog
        title="Are you sure you want to leave?"
        message="By clicking confirm, you will lose the ongoing challenge."
        open={open}
        setOpen={() => setOpen((o) => !o)}
        onConfirm={onLeaveConfirmed}
      />
    </>
  )
}
