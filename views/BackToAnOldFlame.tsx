import { useState } from "react"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, textSize } from "../design-system"
import { ChromeMessaging } from "../services/ChromeMessaging"
import { storage } from "../storage"
import type { Product } from "../storage"
import Celebration from "./Celebration"

type BackToAnOldFlameProps = {
  product: Product | null
  reminderId: string
  onShowThoughtfulPurchase: () => void
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

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md
}

const BackToAnOldFlame = ({
  product,
  reminderId,
  onShowThoughtfulPurchase,
  onClose
}: BackToAnOldFlameProps) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleDontNeedIt = async () => {
    setProcessing(true)
    setShowCelebration(true)

    // Wait 2 seconds to show celebration message, then close tab
    setTimeout(async () => {
      console.log("[BackToAnOldFlame] Requesting tab close...")

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
    }, 2000)
  }

  const handleINeedIt = async () => {
    setProcessing(true)
    try {
      // Update reminder status to completed
      await storage.updateReminder(reminderId, { status: "completed" })
      console.log("[BackToAnOldFlame] Reminder marked as completed")

      // Update product state to iNeedThis
      if (product) {
        await storage.updateProductState(product.id, "iNeedThis")
        console.log("[BackToAnOldFlame] Product state updated to iNeedThis")
      }

      // Navigate to CelebrateThoughtfulPurchase view
      onShowThoughtfulPurchase()
    } catch (error) {
      console.error("[BackToAnOldFlame] Failed to update reminder:", error)
      // Still navigate even if update fails
      onShowThoughtfulPurchase()
    }
  }

  if (showCelebration) {
    return (
      <Celebration
        icon={thoughtfulIcon}
        iconAlt="thoughtful"
        title="🎉 Awesome!"
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
            src={thoughtfulIcon}
            alt="thoughtful"
            style={{ width: "35px", height: "35px" }}
          />
        }
      />

      <h1 style={titleStyle}>
        You said you didn&apos;t need this, did you change your mind?
      </h1>

      <div style={actionsStyle}>
        <Button
          variant="primary"
          onClick={handleDontNeedIt}
          disabled={processing}>
          You are right I don&apos;t need this
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

export default BackToAnOldFlame
