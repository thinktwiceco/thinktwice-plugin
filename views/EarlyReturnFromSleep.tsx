import { useState } from "react"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, textSize } from "../design-system"
import { ProductActionManager } from "../managers/ProductActionManager"
import { ChromeMessaging } from "../services/ChromeMessaging"
import type { Product } from "../storage"
import { formatDuration } from "../utils/time"
import Celebration from "./Celebration"

type EarlyReturnFromSleepProps = {
  product: Product | null
  reminderId: string
  reminderStartTime: number
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
  reminderStartTime,
  onShowINeedIt,
  onClose
}: EarlyReturnFromSleepProps) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Calculate actual time waited
  const timeWaitedFormatted = formatDuration(Date.now() - reminderStartTime)

  const handleKeepWaiting = async () => {
    setProcessing(true)
    setShowCelebration(true)

    // Wait 2 seconds to show celebration message, then close tab
    setTimeout(async () => {
      console.log("[EarlyReturnFromSleep] Requesting tab close...")

      try {
        await ChromeMessaging.closeCurrentTab()
        console.log("[EarlyReturnFromSleep] Tab close request successful")
      } catch (error) {
        console.error("[EarlyReturnFromSleep] Tab close failed:", error)
        // Fallback: hide the overlay
        if (onClose) {
          onClose()
        }
      }
    }, 2000)
  }

  const handleINeedIt = async () => {
    setProcessing(true)
    try {
      // Update product state to iNeedThis and delete reminder
      if (product) {
        await ProductActionManager.needIt(product, reminderId)
        console.log(
          "[EarlyReturnFromSleep] Product marked as iNeedThis, reminder deleted"
        )
      }

      // Navigate to INeedIt view
      onShowINeedIt()
    } catch (error) {
      console.error("[EarlyReturnFromSleep] Failed to execute needIt:", error)
      // Still navigate even if update fails
      onShowINeedIt()
    }
  }

  const handleIDontNeedIt = async () => {
    setProcessing(true)
    if (product) {
      try {
        await ProductActionManager.dontNeedIt(product)
        console.log("[EarlyReturnFromSleep] Product marked as dontNeedIt")
      } catch (error) {
        console.error(
          "[EarlyReturnFromSleep] Failed to mark as dontNeedIt:",
          error
        )
      }
    }
    setShowCelebration(true)

    // Wait 2 seconds to show celebration message, then close tab
    setTimeout(async () => {
      try {
        await ChromeMessaging.closeCurrentTab()
      } catch (error) {
        console.error("[EarlyReturnFromSleep] Tab close failed:", error)
        if (onClose) onClose()
      }
    }, 2000)
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

      <h1 style={titleStyle}>
        You&apos;re back! You waited for {timeWaitedFormatted}.
      </h1>
      <p style={subtitleStyle}>Have you made a decision?</p>

      <div style={actionsStyle}>
        <Button variant="primary" onClick={handleINeedIt} disabled={processing}>
          I need this now
        </Button>
        <Button
          variant="secondary"
          onClick={handleKeepWaiting}
          disabled={processing}>
          I&apos;ll wait
        </Button>
        <Button
          variant="tertiary"
          onClick={handleIDontNeedIt}
          disabled={processing}>
          I don&apos;t need it
        </Button>
      </div>
    </Card>
  )
}

export default EarlyReturnFromSleep
