import { useEffect, useState } from "react"

import { spacing, textSize } from "../design-system"

const MOCK_NUDGES = [
  {
    nudge:
      "Every purchase is a vote for the kind of world you want to live in.",
    theme: "environmental",
    type: "reflection"
  },
  {
    nudge:
      "Waiting 24 hours before buying can save you from impulse purchases you'll regret.",
    theme: "financial",
    type: "advice"
  },
  {
    nudge: "The best purchase is often the one you don't make.",
    theme: "mindfulness",
    type: "wisdom"
  }
]

const CHARS_PER_SECOND = 17

const Nudge = () => {
  const [selectedNudge, setSelectedNudge] = useState("")
  const [visibleCharCount, setVisibleCharCount] = useState(0)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_NUDGES.length)
    setSelectedNudge(MOCK_NUDGES[randomIndex].nudge)
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
          color: "var(--text-color-light)"
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
