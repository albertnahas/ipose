import { Paper, Grid, Typography, ListItemButton } from "@mui/material"
import React, { FC } from "react"
import { keyframes } from "@emotion/react"

const slide = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
  `

export const MainMenuOption: FC<Props> = ({
  title,
  image,
  subtitle,
  onClick,
  animate,
}) => {
  return (
    <Paper
      elevation={16}
      sx={{
        borderRadius: 3,
        my: 2.2,
        animation: animate ? `${slide} 800ms ease;` : "",
      }}
    >
      <ListItemButton aria-label={title?.toLocaleLowerCase()} onClick={onClick}>
        <Grid sx={{ alignItems: "center" }} container>
          <Grid sx={{ textAlign: "left", pl: 1 }} item xs={6}>
            <Typography
              variant="h2"
              color="primary"
              sx={{ fontWeight: 500, fontSize: "1.25rem", lineHeight: 1.6 }}
            >
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Grid>
          <Grid sx={{ height: 105, textAlign: "right" }} item xs={6}>
            <img
              height="130"
              style={{ position: "relative", top: -5 }}
              alt="test"
              src={image}
            />
          </Grid>
        </Grid>
      </ListItemButton>
    </Paper>
  )
}

interface Props {
  title?: string
  subtitle?: string
  image?: string
  onClick: () => void
  animate?: boolean
}
