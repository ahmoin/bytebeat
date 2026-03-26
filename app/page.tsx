"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { PlayIcon, PauseIcon } from "lucide-react"
import * as React from "react"

export default function Page() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(1)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="slider-demo-temperature">Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            className="w-32"
          />
          <Button
            onClick={handlePlay}
            variant={isPlaying ? "outline" : "default"}
            className="mt-2"
          >
            {isPlaying ? (
              <PauseIcon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  )
}
