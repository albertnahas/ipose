import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import { getLevelLabel } from "../../utils/helpers"
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Button,
  Typography,
  TextField,
  ButtonGroup,
  InputLabel,
  MenuItem,
  Select,
  InputAdornment,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box } from "@mui/system"
import { ChallengeSetup } from "../../types/challenge"
import React, { useEffect, useMemo, useState } from "react"
import { defaultRounds } from "../../utils/constants"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined"
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined"

export interface LevelDialogProps {
  open: boolean
  setup?: ChallengeSetup
  onClose: (setup?: ChallengeSetup) => void
}

export const defaultChallengeSetup: ChallengeSetup = {
  level: 1,
  players: 1,
  rounds: 10,
  live: false,
  variation: "standard",
}
const LEVELS_COUNT = 3
const ROUNDS_ARRAY = [5, 10, 15]

export function ChallengeSetupDialog(props: LevelDialogProps) {
  const { onClose, setup, open } = props

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleHelpClose = () => {
    setAnchorEl(null)
  }

  const helpOpen = Boolean(anchorEl)
  const id = helpOpen ? "help-popover" : undefined

  const [roundsController, setRoundsController] = useState<number | string>(
    defaultRounds
  )
  const [customRoundsInput, setCustomRoundsInput] = useState<boolean>(false)

  const formik = useFormik({
    initialValues: {
      ...defaultChallengeSetup,
      ...setup,
    },
    validationSchema: Yup.object({
      players: Yup.number().max(8).min(1).required("players is required"),
      variation: Yup.string().required("variation is required"),
      rounds: Yup.number()
        .max(100)
        .min(2)
        .required("number of rounds is required"),
    }),
    onSubmit: (values, { resetForm, setErrors, setSubmitting }) => {
      onClose({ ...values })
    },
  })

  const liveHelpMessage = useMemo(
    () =>
      formik.values.live
        ? "You will be challenging random players live"
        : "You will have a private challenge link to share",
    [formik]
  )

  useEffect(() => {
    if (roundsController === "custom") {
      setCustomRoundsInput(true)
      formik.setFieldValue("rounds", defaultRounds)
    } else {
      setCustomRoundsInput(false)
      formik.setFieldValue("rounds", Number(roundsController))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundsController])

  const handleClose = () => {
    onClose()
  }

  const variationOptions = [
    {
      title: "Speed",
      description:
        "Answer fast and correctly: if your opponent was faster, you will lose the round and proceed to the next.",
      icon: <SpeedOutlinedIcon />,
    },
    {
      title: "Standard",
      description:
        "All players will get the round points if answered correctly. Boost your score by being fast!",
      icon: <QuestionAnswerOutlinedIcon />,
    },
  ]

  return (
    <Dialog
      onClose={handleClose}
      aria-label={"Challenge Setup"}
      open={open}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>New Game</DialogTitle>
      <Container maxWidth="xs">
        <Typography variant="h3" sx={{ fontSize: "1rem", lineHeight: 1.7 }}>
          Choose your setup
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          {setup?.players !== 1 && (
            <>
              <Box sx={{ my: 1 }}>
                <ButtonGroup aria-label="outlined button group">
                  <Button
                    aria-label="live"
                    variant={formik.values.live ? "contained" : "outlined"}
                    onClick={() => formik.setFieldValue("live", true)}
                  >
                    Live
                  </Button>
                  <Button
                    aria-label="private"
                    variant={!formik.values.live ? "contained" : "outlined"}
                    onClick={() => formik.setFieldValue("live", false)}
                  >
                    Private
                  </Button>
                </ButtonGroup>
              </Box>
              <Typography color="primary" variant="caption">
                {liveHelpMessage}
              </Typography>
              <TextField
                error={Boolean(formik.touched.players && formik.errors.players)}
                helperText={formik.touched.players && formik.errors.players}
                fullWidth
                label="Players"
                margin="normal"
                name="players"
                aria-label="players"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.players}
                variant="outlined"
                type="number"
              />
              <FormControl sx={{ my: 1 }} fullWidth>
                <InputLabel id="variation-label">Variation</InputLabel>
                <Select
                  labelId="variation-label"
                  aria-label="variation"
                  name="variation"
                  value={formik.values.variation}
                  label="Variation"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="variation help"
                        sx={{ mr: 2 }}
                        edge="start"
                        onClick={handleHelpClick}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  {variationOptions.map((option) => {
                    return (
                      <MenuItem
                        key={option.title}
                        value={option.title.toLowerCase()}
                      >
                        {option.title}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </>
          )}
          <FormControl sx={{ display: "block" }}>
            <FormLabel id="rounds-controller-label">Rounds</FormLabel>
            <RadioGroup
              row
              name="roundsController"
              aria-label="rounds-controller"
              value={roundsController}
              onChange={(e) => setRoundsController(e.target.value)}
            >
              {ROUNDS_ARRAY.map((r) => (
                <FormControlLabel
                  key={r}
                  value={r}
                  control={<Radio size="small" />}
                  label={r}
                />
              ))}
              <FormControlLabel
                key="custom"
                value="custom"
                control={<Radio size="small" />}
                label="Custom"
              />
            </RadioGroup>
          </FormControl>
          {customRoundsInput && (
            <TextField
              error={Boolean(formik.touched.rounds && formik.errors.rounds)}
              helperText={formik.touched.rounds && formik.errors.rounds}
              fullWidth
              label="Custom rounds"
              margin="normal"
              name="rounds"
              aria-label="rounds"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.rounds}
              variant="outlined"
              type="number"
            />
          )}
          <FormControl>
            <FormLabel id="level-label">Level</FormLabel>
            <RadioGroup
              name="level"
              aria-label="level"
              value={formik.values.level}
              onChange={formik.handleChange}
            >
              {Array.from({ length: LEVELS_COUNT }, (_, i) => i + 1).map(
                (l) => (
                  <FormControlLabel
                    key={l}
                    value={l}
                    control={<Radio size="small" />}
                    label={getLevelLabel(l)}
                  />
                )
              )}
            </RadioGroup>
          </FormControl>
          <Box sx={{ py: 2 }}>
            <Button
              color="primary"
              disabled={formik.isSubmitting}
              fullWidth
              size="large"
              type="submit"
              aria-label="submit setup"
              variant="outlined"
            >
              Create
            </Button>
          </Box>
          <Popover
            id={id}
            open={helpOpen}
            anchorEl={anchorEl}
            onClose={handleHelpClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            aria-label="help popover"
          >
            <List
              sx={{
                width: "100%",
                maxWidth: 350,
                bgcolor: "background.paper",
              }}
            >
              {variationOptions.map((option) => {
                return (
                  <ListItem key={option.title}>
                    <ListItemIcon>{option.icon}</ListItemIcon>
                    <ListItemText
                      primary={option.title}
                      secondary={option.description}
                    />
                  </ListItem>
                )
              })}
            </List>
          </Popover>
        </form>
      </Container>
    </Dialog>
  )
}
