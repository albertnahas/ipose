import { useState } from "react"
import logo from "./logo.svg"
import { Container, Typography } from "@mui/material"
import { List } from "./components/List/List"

function App() {
  return (
    <Container>
      <Typography
        color="text.secondary"
        sx={{ mt: 4, mb: 2, textAlign: "center" }}
        variant="h3"
      >
        <img
          src={logo}
          width="50"
          style={{ marginRight: 10 }}
          className="App-logo"
          alt="logo"
        />
        iPose
      </Typography>
      <List />
    </Container>
  )
}

export default App
