import { FC } from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { useTheme } from "@mui/system"

export var Landing: FC<Props> = function (props) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        flexGrow: 1,
        textAlign: "center",
        width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        backgroundImage: `url('/assets/imgs/${
          theme.palette.mode === "dark" ? "world-dark" : "world"
        }.svg') !important`,
      }}
    >
      <Typography
        sx={{ fontWeight: "400", fontSize: { md: "4em", xs: "3em" } }}
        variant="h1"
        aria-label="IPose"
        color="primary.light"
      >
        IPose
      </Typography>
      <img
        alt="Intro"
        title="Intro"
        height="200"
        src="/assets/imgs/intro.webp"
        style={{ borderRadius: 8, margin: 10 }}
      />
      <Typography
        sx={{
          m: 2,
          fontSize: "18px",
          fontWeight: 400,
          px: { xs: "2.5rem", md: 0 },
        }}
        variant="h2"
        color="text.primary"
      >
        The best sex positions identifying and guessing game
      </Typography>
      <Paper elevation={0} sx={{ p: 1 }}>
        <Typography variant="body2" color="textSecondary" align="left">
          &#11088; Discover more than 300 positions
          <br />
          &#11088; Invite your friends
          <br />
          &#11088; Challenge random players
          <br />
          &#11088; Improve your sex knowledge
        </Typography>
      </Paper>
      <Button
        color="primary"
        fullWidth
        size="large"
        onClick={props.login}
        sx={{
          width: 200,
          mt: 3,
        }}
        aria-label="get started"
        variant="contained"
      >
        Get started
      </Button>
    </Box>
  )
}

interface Props {
  login: () => void
}
