import { useState, useEffect } from "react"
import { spacing } from "../design-system"

const MOCK_NUDGES = [
  {
    nudge: "Every purchase is a vote for the kind of world you want to live in.",
    theme: "environmental",
    type: "reflection"
  },
  {
    nudge: "Waiting 24 hours before buying can save you from impulse purchases you'll regret.",
    theme: "financial",
    type: "advice"
  },
  {
    nudge: "The best purchase is often the one you don't make.",
    theme: "mindfulness",
    type: "wisdom"
  }
]

const Nudge = () => {
  const [selectedNudge, setSelectedNudge] = useState("")

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_NUDGES.length)
    setSelectedNudge(MOCK_NUDGES[randomIndex].nudge)
  }, [])

  return (
    <div className="info-container" style={{ textAlign: "center", marginBottom: spacing.sm }}>
      <p className="info-container-text" style={{ fontWeight: "500" }}>{selectedNudge}</p>
    </div>
  )
}

export default Nudge
