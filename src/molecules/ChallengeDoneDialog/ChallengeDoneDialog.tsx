import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"

import { DialogActions, DialogContent, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { challengeSelector } from "../../store/challengeSlice"
import { userSelector } from "../../store/userSlice"
import { useEffect, useMemo, useState } from "react"
import { Player } from "../../types/challenge"
import { getEval } from "../../utils/helpers"
import { Box, Container } from "@mui/system"
import { AnimatedBadge } from "../../atoms/AnimatedBadge/AnimatedBadge"
import { Medal } from "../../icons/Medal/Medal"
import _ from "lodash"
import { RematchButton } from "../../atoms/RematchButton/RematchButton"
import bonuses from "../../data/bonuses.json"
import { useUser } from "../../hooks/useUser"

export interface ChallengeDoneDialogProps {
  open: boolean
  onClose: () => void
  onClickRematch: () => void
  onClickPlayAgain: () => void
  players?: Player[]
}

export function ChallengeDoneDialog({
  onClose,
  onClickRematch,
  onClickPlayAgain,
  open,
  players,
}: ChallengeDoneDialogProps) {
  const challenge = useSelector(challengeSelector)
  const user = useSelector(userSelector)
  const { updateUser } = useUser()
  const [unlock, setUnlock] = useState(false)
  const stats = useMemo(() => {
    return user?.history?.slice(-1).pop()
  }, [user?.history])

  const winner = useMemo(() => {
    if (!players || players.length < 2) return
    return _.maxBy(players, "timedScore")
  }, [players])

  const handleClose = () => {
    onClose()
  }

  const bonuseKey = useMemo(
    () => _.sample(Object.keys(bonuses)) as keyof typeof bonuses,
    []
  )
  const bonuseImage = useMemo(
    () => _.random(1, bonuses[bonuseKey], false),
    [bonuseKey]
  )

  const won = winner ? winner?.displayName === user?.displayName : true
  const evaluation = getEval(stats?.accuracy || 0)

  const saveBonuse = () => {
    if (unlock) {
      updateUser({
        ...user,
        bonuses: [...(user?.bonuses || []), `${bonuseKey}/1 (${bonuseImage})`],
      })
    }
  }

  return (
    <Dialog onClose={handleClose} aria-label={"Challenge done"} open={open}>
      <DialogContent sx={{ minWidth: { xs: 240, sm: 300 } }}>
        <Container sx={{ textAlign: "center" }}>
          <Typography variant="body1">Game Completed</Typography>
          <Typography color="primary" variant="h5">
            SCORED {stats?.xp}
          </Typography>
          {winner && (
            <Typography
              component="p"
              aria-label="winner"
              variant="h5"
              color={won ? "success.main" : "error.main"}
              sx={{ my: 1 }}
            >
              {won ? "You" : winner.displayName} won!
            </Typography>
          )}
          <AnimatedBadge
            noStars={!won || !stats?.accuracy}
            style={{ margin: "1.5em auto" }}
          >
            <Medal type={evaluation.medal} />
          </AnimatedBadge>
          <Typography component="span" variant="body1">
            Unlock your bonuse of {bonuseKey}!
          </Typography>
          {!unlock && (
            <Button
              onClick={() => {
                setUnlock(true)
              }}
            >
              Unlock here
            </Button>
          )}
          {unlock && (
            <>
              <Box>
                <img
                  style={{
                    width: 300,
                    maxHeight: 200,
                    borderRadius: 8,
                    marginTop: "1em",
                    marginBottom: "1em",
                  }}
                  src={`./assets/imgs/${bonuseKey}/1 (${bonuseImage}).gif`}
                  alt={bonuseKey}
                />
              </Box>
            </>
          )}
          <Box>
            <Typography component="span" color="primary" variant="body1">
              {(stats?.accuracy || 0) * 100}%
            </Typography>
            <Typography component="span" variant="body1">
              {" "}
              accuracy
            </Typography>
            {/* <ProgressLine
              variant="determinate"
              value={(stats?.accuracy || 0) * 100}
              color="primary"
              sx={{ m: 1 }}
            /> */}
          </Box>
          <Typography variant="body1">{evaluation.message}</Typography>
          {/* <Typography color="primary" variant="body2">
            XP +{(stats?.level || 1) * (stats?.xp || 0)}
          </Typography> */}
        </Container>
      </DialogContent>

      <DialogActions>
        {players && players.length > 1 ? (
          <RematchButton
            onClick={onClickRematch}
            pulsing={challenge?.rematchRequested}
            variant="text"
            color="primary"
          />
        ) : (
          <Button onClick={onClickPlayAgain} aria-label="play again" autoFocus>
            Play again
          </Button>
        )}
        <Button onClick={handleClose} aria-label="leave dialog" autoFocus>
          Return to menu
        </Button>
      </DialogActions>
    </Dialog>
  )
}
