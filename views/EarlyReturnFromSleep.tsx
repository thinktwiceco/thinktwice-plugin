import { useState } from "react"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, textSize } from "../design-system"
import { storage } from "../storage"
import type { Product } from "../storage"
import Celebration from "./Celebration"

type EarlyReturnFromSleepProps = {
  product: Product | null
  reminderId: string
  onShowINeedIt: () => void
  onClose?: () => void
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.md} 0`,
  lineHeight: "1.3"
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.xxl} 0`,
  opacity: "0.9",
  lineHeight: "1.4"
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md
}

const EarlyReturnFromSleep = ({
  product,
  reminderId,
  onShowINeedIt,
  onClose
}: EarlyReturnFromSleepProps) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleKeepWaiting = async () => {
    setProcessing(true)
    setShowCelebration(true)

    // Wait 2 seconds to show celebration message, then close tab
    setTimeout(() => {
      console.log("[EarlyReturnFromSleep] Requesting tab close...")

      // Use Chrome Extension API to close the current tab
      chrome.runtime.sendMessage({ type: "CLOSE_CURRENT_TAB" }, (response) => {
        if (response?.success) {
          console.log("[EarlyReturnFromSleep] Tab close request successful")
        } else {
          console.error("[EarlyReturnFromSleep] Tab close failed:", response)
          // Fallback: hide the overlay
          if (onClose) {
            onClose()
          }
        }
      })
    }, 2000)
  }

  const handleINeedIt = async () => {
    setProcessing(true)
    try {
      // Update reminder status to completed
      await storage.updateReminder(reminderId, { status: "completed" })
      console.log("[EarlyReturnFromSleep] Reminder marked as completed")

      // Update product state to iNeedThis
      if (product) {
        await storage.updateProductState(product.id, "iNeedThis")
        console.log("[EarlyReturnFromSleep] Product state updated to iNeedThis")
      }

      // Navigate to INeedIt view
      onShowINeedIt()
    } catch (error) {
      console.error("[EarlyReturnFromSleep] Failed to update reminder:", error)
      // Still navigate even if update fails
      onShowINeedIt()
    }
  }

  if (showCelebration) {
    return (
      <Celebration
        icon={clockIcon}
        iconAlt="clock"
        title="🎉 Great choice! Keep it up!"
        subtitle="Closing tab..."
        onClose={onClose}
      />
    )
  }

  return (
    <Card>
      <Header
        onClose={onClose}
        centerIcon={
          <img
            src={clockIcon}
            alt="clock"
            style={{ width: "35px", height: "35px" }}
          />
        }
      />

      <h1 style={titleStyle}>Hey there! You're back early.</h1>
      <p style={subtitleStyle}>Did you change your mind about waiting?</p>

      <div style={actionsStyle}>
        <Button
          variant="primary"
          onClick={handleKeepWaiting}
          disabled={processing}>
          You're right, I'll wait
        </Button>
        <Button
          variant="tertiary"
          onClick={handleINeedIt}
          disabled={processing}>
          I need this now
        </Button>
      </div>
    </Card>
  )
}

export default EarlyReturnFromSleep
