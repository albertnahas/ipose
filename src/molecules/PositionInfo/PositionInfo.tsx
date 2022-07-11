import { Typography } from "@mui/material"
import React, { FC } from "react"

export const PositionInfo: FC<Props> = ({ name, info }) => {
  return (
    <>
      <Typography variant="h6" sx={{ my: 2, textAlign: "center" }}>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ my: 1 }}>
        {info}
      </Typography>
    </>
  )
}

export interface Props {
  name: string
  info: string
}
