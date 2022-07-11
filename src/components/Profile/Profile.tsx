import { FC, useEffect, useMemo, useState } from "react"
import {
  Container,
  Box,
  Grid,
  Button,
  Paper,
  Typography,
  Stack,
} from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import ModalDialog from "../../molecules/ModalDialog/ModalDialog"
import { ControlLink } from "../ControlPages/ControlPage"
import { DeleteAccountForm } from "./DeleteAccountForm"
import { userSelector } from "../../store/userSlice"
import { useUser } from "../../hooks/useUser"
import { ProfilePhoto } from "./partials/ProfilePhoto/ProfilePhoto"
import { EditableDisplay } from "./partials/EditableDisplay/EditableDisplay"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SchoolIcon from "@mui/icons-material/School"
import LogoutIcon from "@mui/icons-material/Logout"

import moment from "moment"
import { ProgressRing } from "../../atoms/ProgressRing/ProgressRing"
import { ProfileHeadlines } from "./partials/ProfileHeadlines/ProfileHeadlines"
import { LvInfo } from "./partials/LvInfo/LvInfo"
import { facebookProvider, googleProvider } from "../../App"
import { Google } from "../../icons/google"
import { Facebook } from "@mui/icons-material"
import { setSnackbar } from "../../store/snackbarSlice"
import firebase from "../../config"
import { useAnalytics } from "../../hooks/useAnalytics"

export const Profile: FC<Props> = ({ signOut }) => {
  const user = useSelector(userSelector)
  const dispatch = useDispatch()
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false)

  const { updateUser, linkAccount } = useUser()
  const { logEvent } = useAnalytics()
  const [imageAsUrl, setImageAsUrl] = useState<any>(user?.photoURL)

  const [viewBonuses, setViewBonuses] = useState(false)

  const onClickSubmitDisplayName = (name?: string) => {
    return updateUser({ ...user, displayName: name || "" })
  }

  const onUploadPhoto = (photoURL: string) => {
    return updateUser({ ...user, photoURL })
  }

  const lastPlayed = useMemo(() => {
    var currentTimestamp = moment(new Date()).format("HH:mm:ss")
    return user?.lastPlayedAt
      ? moment
          .duration(
            moment(currentTimestamp, "HH:mm:ss").diff(
              moment(user?.lastPlayedAt?.toDate(), "HH:mm:ss")
            )
          )
          .humanize() + " ago"
      : "No games yet"
  }, [user])

  const linkSocialAccount = (provider: firebase.auth.AuthProvider) =>
    linkAccount(provider, user)
      ?.then(() => {
        dispatch(
          setSnackbar({
            open: true,
            message: `Account has been linked!`,
            type: "success",
          })
        )
      })
      .catch((e: any) => {
        dispatch(
          setSnackbar({
            open: true,
            message: `${e.message}`,
            duration: 2000,
            type: "error",
          })
        )
      })

  const linkWithFacebook = () => linkSocialAccount(facebookProvider)
  const linkWithGoogle = () => linkSocialAccount(googleProvider)

  useEffect(() => {
    logEvent("profile_view", { userId: user?.uid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container aria-label="profile container" maxWidth="sm">
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <Box>
            <Box sx={{ mt: 4, mb: 2 }}>
              <ProfilePhoto
                imageAsUrl={imageAsUrl}
                setImageAsUrl={setImageAsUrl}
                onUpload={onUploadPhoto}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <EditableDisplay
                name="displayName"
                label={"The username others will see"}
                onSubmit={onClickSubmitDisplayName}
                text={user?.displayName}
              />
            </Box>
          </Box>
          {/* <Divider sx={{ mt: 2, mb: 2 }} variant="middle" /> */}
        </Grid>
        <Grid xs={12} item>
          <ProfileHeadlines />
        </Grid>
        <Grid xs={6} item>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <Grid sx={{ alignItems: "center" }} container>
              <Grid xs={9} item>
                <Typography variant="caption">Last played</Typography>
                <Typography variant="body2">{lastPlayed}</Typography>
              </Grid>
              <Grid xs={3} item>
                <AccessTimeIcon fontSize="large" sx={{ opacity: 0.4 }} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid xs={6} item>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              backgroundColor: "secondary.light",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <Grid sx={{ alignItems: "center" }} container>
              <Grid xs={9} item>
                <Typography variant="caption">Accuracy</Typography>
                <Typography variant="body1">
                  {Math.round((user?.accuracy || 0) * 100)}%
                </Typography>
              </Grid>
              <Grid xs={3} item>
                <ProgressRing
                  size={35}
                  color="#fff"
                  value={(user?.accuracy || 0) * 100}
                  thickness={3}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              textAlign: "left",
            }}
          >
            <LvInfo />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <SchoolIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Boost your knowledge: check positions info in the{" "}
              <ControlLink sx={{ fontWeight: 500 }} to="/learn">
                Learn
              </ControlLink>{" "}
              section.
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Button
            variant="contained"
            onClick={() => {
              setViewBonuses((v) => !v)
            }}
          >
            {!viewBonuses ? "View" : "Hide"} bonuses
          </Button>
        </Grid>
        {viewBonuses && (
          <Grid xs={12} item>
            {user?.bonuses?.map((bonus: string) => (
              <img
                style={{
                  height: 100,
                  borderRadius: 8,
                  margin: 4,
                }}
                src={`./assets/imgs/${bonus}.gif`}
                alt={bonus}
              />
            ))}
          </Grid>
        )}
        <Grid xs={12} item>
          <Stack direction="row" sx={{ justifyContent: "center" }} spacing={1}>
            {!user?.providers?.includes("google.com") && (
              <Button
                onClick={linkWithGoogle}
                color="error"
                size="medium"
                variant="text"
                endIcon={<Google />}
              >
                Connect
              </Button>
            )}
            {!user?.providers?.includes("facebook.com") && (
              <Button
                onClick={linkWithFacebook}
                color="info"
                size="medium"
                variant="text"
                endIcon={<Facebook />}
              >
                Connect
              </Button>
            )}
          </Stack>
        </Grid>
        <Grid xs={12} sx={{ mt: 4 }} item>
          <Button
            onClick={signOut}
            color="warning"
            size="small"
            variant="outlined"
            endIcon={<LogoutIcon />}
          >
            Sign out
          </Button>
        </Grid>

        <Grid xs={12} item>
          <Button
            onClick={() => setOpenDeleteAccount(true)}
            color="error"
            size="small"
            variant="text"
            sx={{ my: 1 }}
          >
            Delete Account
          </Button>
        </Grid>
      </Grid>
      <ModalDialog
        maxWidth="sm"
        open={openDeleteAccount}
        setOpen={setOpenDeleteAccount}
      >
        <DeleteAccountForm />
      </ModalDialog>
    </Container>
  )
}

interface Props {
  signOut?: () => void
}
