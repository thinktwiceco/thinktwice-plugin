import { useState } from "react"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, typography, layout, iconSize } from "../design-system"
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

  // Calculate actual time waited
  const timeWaitedFormatted = formatDuration(Date.now() - reminderStartTime)

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

  const handleCelebrationClose = async () => {
    console.log("[BackToAnOldFlame] Requesting tab close after celebration...")

    try {
      await ChromeMessaging.closeCurrentTab()
      console.log("[BackToAnOldFlame] Tab close request successful")
    } catch (error) {
      console.error("[BackToAnOldFlame] Tab close failed:", error)
      // Fallback: hide the overlay
      if (onClose) {
        onClose()
      }
    }
  }

  if (celebrationType === "dontNeed") {
    return (
      <Celebration
        icon={thoughtfulIcon}
        iconAlt="thoughtful"
        title="🎉 Awesome!"
        subtitle="Closing tab..."
        autoCloseDelay={2000}
        onClose={handleCelebrationClose}
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
