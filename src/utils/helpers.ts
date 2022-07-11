/* eslint-disable no-mixed-operators */
// const poses_e = poses.map(lan => {
//     var l = pop.find(p => p.position.match(lan.name))
//     if (l) return { ...l, ...lan }
//     return lan
// })

import { Position } from "../types/position"
import _ from "lodash"
import { MedalType } from "../icons/Medal/Medal"

const wikipediaURL =
  "https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&prop=extracts&exintro&explaintext&redirects=1&titles="

const avatarURL = "https://avatars.dicebear.com/api/identicon/"

export const generatePoseChoices = (
  levelPoses?: Position[],
  pose?: Position
) => {
  if (!pose) return []
  let poseChoices = _.sampleSize(levelPoses, 4)
  while (poseChoices.find((l) => l?.name === pose.name)) {
    poseChoices = _.sampleSize(levelPoses, 4)
  }
  poseChoices.push(pose)
  return _.shuffle(poseChoices)
}

export const getAvatarURL = () => {
  const seed = Math.round(Math.random() * 99999)
  return `${avatarURL}${seed}.svg`
}

export const getLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return "Easy"
    case 2:
      return "Medium"
    case 3:
      return "Hard"
    default:
      return "Impossible"
  }
}

export const gameEvals: {
  medal: MedalType
  message: string
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning"
}[] = [
  { medal: "grey", message: "way to go", color: "error" },
  { medal: "blue", message: "You still have a lot to learn", color: "warning" },
  { medal: "silver", message: "You have a good knowledge!", color: "primary" },
  { medal: "purple", message: "You are a sex master!!", color: "primary" },
  { medal: "gold", message: "You are a pornstar!!!", color: "success" },
]

export const getEval = (accuracy: number) => {
  switch (true) {
    case accuracy < 0.2:
      return gameEvals[0]
    case accuracy < 0.4:
      return gameEvals[1]
    case accuracy < 0.6:
      return gameEvals[2]
    case accuracy < 0.8:
      return gameEvals[3]
    default:
      return gameEvals[4]
  }
}

export const getLv = (xp?: number) => {
  const factor = 150
  let n = factor,
    lv = 1

  while (n <= (xp || 0)) {
    n += Math.round(factor * Math.pow(lv, 1.5))
    lv++
  }

  return {
    lv,
    next: n,
    progress: Math.round(((xp || 0) * 100) / (n || 1)),
  }
}

// mulberry32
export const getRandomFromSeed = (a: number) => {
  var t = (a += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const getPositionInfo = (position?: Position) => {
  return fetch(
    wikipediaURL + encodeURIComponent(`${position?.name} position`),
    {
      method: "GET",
    }
  )
}

export const getBrowserLocales = (options = {}) => {
  const defaultOptions = {
    positionCodeOnly: false,
  }
  const opt = {
    ...defaultOptions,
    ...options,
  }
  const browserLocales =
    navigator.languages === undefined
      ? [navigator.language]
      : navigator.languages
  if (!browserLocales) {
    return undefined
  }
  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim()
    return opt.positionCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale
  })
}
