import { FC } from "react"
import { useSelector } from "react-redux"
import { State } from "../../types/state"
import { Landing } from "../Landing/Landing"
import { useNavigate } from "react-router-dom"
import { MainMenu } from "../MainMenu/MainMenu"

export const Home: FC<Props> = function () {
  const user = useSelector((state: State) => state.user.value)
  const navigate = useNavigate()

  return user !== null ? (
    <MainMenu />
  ) : (
    <Landing login={() => navigate("/login")} />
  )
}

interface Props {}
