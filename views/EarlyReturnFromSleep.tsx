/**
 * EarlyReturnFromSleep View
 *
 * Shown when a user returns to a product page BEFORE the "Sleep on it" reminder timer has expired.
 * This indicates they couldn't resist and came back early, breaking their commitment to wait.
 *
 * Scenario: User clicked "Sleep on it" (e.g., 24 hours), but came back after only 2 hours.
 *
 * Key differences from BackToAnOldFlame:
 * - Uses "Clock" icon (vs Thoughtful icon)
 * - Messaging emphasizes timing and encourages continuing to wait
 * - Button options: "I need this now" / "I'll wait" / "I don't need it"
 */

import { useEffect, useState } from "react"
import alarmIcon from "url:../assets/icons/Icons/clock_blue_outline.png"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"
import handsClappingIcon from "url:../assets/icons/Icons/hands-clapping-green.png"
import trophyIcon from "url:../assets/icons/Icons/shooting_star_red.png"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { iconSize, layout, typography } from "../design-system"
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
  ...typography.title
}

const subtitleStyle: React.CSSProperties = {
  ...typography.subtitle
}

const actionsStyle: React.CSSProperties = {
  ...layout.actionsContainer
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
  const [countdown, setCountdown] = useState<number | null>(null)

  // Calculate actual time waited
  const timeWaitedFormatted = formatDuration(Date.now() - reminderStartTime)

  // Handle countdown and tab close
  useEffect(() => {
    if (countdown === null) return

    if (countdown === 0) {
      // Close the tab when countdown reaches 0
      const closeTab = async () => {
        console.log("[EarlyReturnFromSleep] Requesting tab close...")
        try {
          await ChromeMessaging.closeCurrentTab()
          console.log("[EarlyReturnFromSleep] Tab close request successful")
        } catch (error) {
          console.error("[EarlyReturnFromSleep] Tab close failed:", error)
          if (onClose) {
            onClose()
          }
        }
      }
      closeTab()
      return
    }

    // Decrement countdown every second
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, onClose])

  const handleKeepWaiting = async () => {
    setProcessing(true)
    setShowCelebration(true)
    setCountdown(5) // Start 5-second countdown
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
    setCountdown(5) // Start 5-second countdown
  }

  if (showCelebration) {
    return (
      <Celebration
        icon={clockIcon}
        iconAlt="clock"
        title="🎉 Great choice! Keep it up!"
        subtitle={
          countdown !== null && countdown > 0
            ? `Closing tab in ${countdown}`
            : "Closing tab..."
        }
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
            style={{ width: iconSize.large, height: iconSize.large }}
          />
        }
      />

      <h1 style={titleStyle}>
        You&apos;re back! You waited for {timeWaitedFormatted}.
      </h1>
      <p style={subtitleStyle}>Have you made a decision?</p>

      <div style={actionsStyle}>
        <Button
          variant="primaryEmphasized"
          icon={handsClappingIcon}
          onClick={handleIDontNeedIt}
          disabled={processing}>
          I don&apos;t need it
        </Button>
        <Button
          variant="secondary"
          icon={alarmIcon}
          onClick={handleKeepWaiting}
          disabled={processing}>
          Sleep on it
        </Button>
        <Button
          variant="tertiary"
          icon={trophyIcon}
          iconSize="26px"
          onClick={handleINeedIt}
          disabled={processing}>
          I need this now
        </Button>
      </div>
    </Card>
  )
}

export default EarlyReturnFromSleep
