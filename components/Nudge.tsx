import { useEffect, useState } from "react"

import nudgesData from "../assets/Nudge_Language_Categorized_Updated.json"
import { spacing, textSize } from "../design-system"

const CHARS_PER_SECOND = 17

const Nudge = () => {
  const [selectedNudge, setSelectedNudge] = useState("")
  const [visibleCharCount, setVisibleCharCount] = useState(0)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * nudgesData.length)
    setSelectedNudge(nudgesData[randomIndex].nudge)
  }, [])

  useEffect(() => {
    if (!selectedNudge) return

    setVisibleCharCount(0)

    const intervalMs = 1000 / CHARS_PER_SECOND

    const intervalId = setInterval(() => {
      setVisibleCharCount((prev) => {
        if (prev < selectedNudge.length) {
          return prev + 1
        } else {
          clearInterval(intervalId)
          return prev
        }
      })
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [selectedNudge])

  return (
    <div
      className="info-container"
      style={{
        textAlign: "center",
        marginBottom: spacing.sm,
        border: "none",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
      }}>
      <p
        className="info-container-text"
        style={{
          fontWeight: "600",
          fontSize: textSize.lg,
          color: "var(--text-color-light)",
          width: "100%"
        }}>
        <span style={{ color: "var(--text-color-light)" }}>
          {selectedNudge.slice(0, visibleCharCount)}
        </span>
        <span style={{ color: "var(--background-color)" }}>
          {selectedNudge.slice(visibleCharCount)}
        </span>
      </p>
    </div>
  )
}

export default Nudge
