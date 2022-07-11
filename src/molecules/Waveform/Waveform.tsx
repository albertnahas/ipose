import { styled } from "@mui/system"
import Box from "@mui/material/Box"
import React, { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import { isiOS } from "../../utils/utils"
import { LinearProgress, Typography } from "@mui/material"
import { audioTimeout } from "../../utils/constants"

export const WaveformContainer = styled("div")`
  height: 100px;
  width: 100%;
  background: transparent;
`

export const PlayContainer = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const Wave = styled("div")`
  width: 100%;
  height: 90px;
`

export const PlayButton = styled("button")`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  background: #efefef;
  border-radius: 50%;
  border: none;
  outline: none;
  cursor: pointer;
  padding-bottom: 3px;
  &:hover {
    background: #ddd;
  }
`

export const Waveform = ({
  url,
  onActive,
  onError,
}: {
  url: string
  onActive: any
  onError?: (e: string) => Boolean
}) => {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef<Boolean>(true)
  const [error, setError] = useState<string>()
  const waveform = useRef<WaveSurfer>()
  const waveformRef = useRef<HTMLMediaElement>(null)
  const audioRef = useRef<HTMLMediaElement>(null)

  const ios = isiOS()

  const loadAudio = () =>
    (waveform.current = WaveSurfer.create({
      barWidth: 3,
      cursorWidth: 1,
      container: "#waveform",
      backend: "WebAudio",
      height: 80,
      progressColor: "#2D5BFF",
      responsive: true,
      waveColor: "#EFEFEF",
      cursorColor: "transparent",
      hideScrollbar: true,
      normalize: true,
    }))

  useEffect(() => {
    loadAudio()

    if (audioRef && audioRef.current) {
      audioRef.current.id = "audio-player-iosfix"
      audioRef.current.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV"
      audioRef.current.play()
    }

    waveform.current?.load(waveformRef.current || "")
    setPlaying(false)

    waveform.current?.on("ready", function () {
      setLoading(false)
      if (!!error) {
        setError(undefined)
      }
      loadingRef.current = false
    })

    waveform.current?.on("error", onAudioError)

    setTimeout(() => {
      if (loadingRef.current) {
        onAudioError("Error loading audio file")
      }
    }, audioTimeout * 1000)

    return () => {
      waveform.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const onAudioError = (e: string) => {
    const handled = onError?.(e)
    if (!handled) {
      setLoading(false)
      loadingRef.current = false
      setError(e)
    }
    console.log(e)
  }
  useEffect(() => {
    waveform.current?.on("play", onActive)

    return () => {
      waveform.current?.un("play", onActive)
    }
  }, [onActive])

  const handlePlay = () => {
    setPlaying((p) => !p)
    waveform.current?.playPause()
  }

  return (
    <WaveformContainer aria-label="audio container">
      {loading && (
        <Box sx={{ width: "100%", mt: 3 }}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            The audio is loading... Please wait.
          </Typography>
          <LinearProgress />
        </Box>
      )}
      {!!error && (
        <Typography variant="body1" color="textSecondary" mb={2}>
          {error}
        </Typography>
      )}
      <PlayContainer>
        <PlayButton
          onClick={handlePlay}
          sx={{ display: loading ? "none" : "flex" }}
        >
          {!playing ? <PlayArrowIcon color="primary" /> : <PauseIcon />}
        </PlayButton>
        <Wave id="waveform" />
        <audio ref={waveformRef} id="track" src={url} />
        {ios && <audio ref={audioRef} />}
      </PlayContainer>
    </WaveformContainer>
  )
}
