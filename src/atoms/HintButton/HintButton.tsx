import { Tooltip, IconButton } from "@mui/material"
import React, { FC } from "react"
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates"

export const HintButton: FC<Props> = ({ disabled, onClick, hintsLeft }) => {
  const disabledTitle =
    hintsLeft !== 0
      ? "You can only use one hint per round"
      : "You have used maximum available hints per game"
  return (
    <Tooltip
      title={disabled ? `${disabledTitle}` : "Give me a hint"}
      placement="top"
      arrow
    >
      <span>
        <IconButton
          size="large"
          color="primary"
          aria-label="hint button"
          disabled={disabled}
          sx={{
            cursor: disabled ? "not-allowed !important" : "pointer",
          }}
          onClick={onClick}
        >
          <TipsAndUpdatesIcon />
        </IconButton>
      </span>
    </Tooltip>
  )
}

export interface Props {
  disabled?: boolean
  onClick?: () => void
  hintsLeft?: number
}
