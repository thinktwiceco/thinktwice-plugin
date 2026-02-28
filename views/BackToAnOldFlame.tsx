/**
 * BackToAnOldFlame View
 *
 * Shown when a user returns to a product page AFTER the "Sleep on it" reminder timer has expired.
 * This indicates they successfully waited the full duration and are now thoughtfully reconsidering.
 *
 * Scenario: User clicked "Sleep on it", reminder expired (e.g., after 24 hours), and user came back.
 *
 * Key differences from EarlyReturnFromSleep:
 * - Uses "Thoughtful" icon (vs Clock icon)
 * - Messaging emphasizes successful waiting and thoughtful decision-making
 * - Button options: "Yes, I want it" / "I don't need it" / "I'm still not sure"
 */

import { useEffect, useState } from "react"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { iconSize, layout, typography } from "../design-system"
import { ProductActionManager } from "../managers/ProductActionManager"
import { ChromeMessaging } from "../services/ChromeMessaging"
import type { Product } from "../storage"
import { formatDuration } from "../utils/time"
import Celebration from "./Celebration"

type BackToAnOldFlameProps = {
  product: Product | null
  reminderId: string
  reminderStartTime: number
  onShowThoughtfulPurchase: () => void
  onClose?: () => void
}

const titleStyle: React.CSSProperties = {
  ...typography.title
}

const actionsStyle: React.CSSProperties = {
  ...layout.actionsContainer
}

const BackToAnOldFlame = ({
  product,
  reminderId,
  reminderStartTime,
  onClose
}: BackToAnOldFlameProps) => {
  const [celebrationType, setCelebrationType] = useState<
    "dontNeed" | "needIt" | null
  >(null)
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
        console.log("[BackToAnOldFlame] Requesting tab close...")
        try {
          await ChromeMessaging.closeCurrentTab()
          console.log("[BackToAnOldFlame] Tab close request successful")
        } catch (error) {
          console.error("[BackToAnOldFlame] Tab close failed:", error)
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

  const handleDontNeedIt = async () => {
    setProcessing(true)

    // Update product state to dontNeedIt
    if (product) {
      try {
        await ProductActionManager.dontNeedIt(product)
        console.log("[BackToAnOldFlame] Product marked as dontNeedIt")
      } catch (error) {
        console.error("[BackToAnOldFlame] Failed to mark as dontNeedIt:", error)
      }
    }

    setCelebrationType("dontNeed")
    setCountdown(5) // Start 5-second countdown
  }

  const handleINeedIt = async () => {
    setProcessing(true)

    // Delete reminder and update product state to iNeedThis
    if (product) {
      try {
        await ProductActionManager.needIt(product, reminderId)
        console.log(
          "[BackToAnOldFlame] Product marked as iNeedThis, reminder deleted"
        )
      } catch (error) {
        console.error("[BackToAnOldFlame] Failed to execute needIt:", error)
        // Continue to show celebration even if operation fails
      }
    }

    // Show celebration regardless of storage operation result
    setCelebrationType("needIt")
  }

  if (celebrationType === "dontNeed") {
    return (
      <Celebration
        icon={thoughtfulIcon}
        iconAlt="thoughtful"
        title="🎉 Awesome!"
        subtitle={
          countdown !== null && countdown > 0
            ? `Closing tab in ${countdown}`
            : "Closing tab..."
        }
        onClose={onClose}
      />
    )
  }

  if (celebrationType === "needIt") {
    return (
      <Celebration
        icon={thoughtfulIcon}
        iconAlt="thoughtful"
        title="🎉 Awesome!"
        subtitle="You made a thoughtful choice! Enjoy your purchase!"
        autoCloseDelay={4000}
      />
    )
  }

  return (
    <Card>
      <Header
        onClose={onClose}
        centerIcon={
          <img
            src={thoughtfulIcon}
            alt="thoughtful"
            style={{ width: iconSize.large, height: iconSize.large }}
          />
        }
      />

      <h1 style={titleStyle}>
        You&apos;re back! You&apos;ve been thoughtful for {timeWaitedFormatted}.
      </h1>
      <p
        style={{
          ...typography.subtitleLarge,
          fontWeight: "normal"
        }}>
        Have you made up your mind?
      </p>

      <div style={actionsStyle}>
        <Button variant="primary" onClick={handleINeedIt} disabled={processing}>
          Yes, I want it
        </Button>
        <Button
          variant="secondary"
          onClick={handleDontNeedIt}
          disabled={processing}>
          I don&apos;t need it
        </Button>
        <Button variant="tertiary" onClick={onClose} disabled={processing}>
          I&apos;m still not sure
        </Button>
      </div>
    </Card>
  )
}

export default BackToAnOldFlame
