import { useEffect, useState } from "react"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"
import trophyIcon from "url:../assets/icons/Icons/Trophy.png"

import Nudge from "../components/Nudge"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import PauseMenu, { type PauseDuration } from "../components/ui/PauseMenu"
import PrivacyBadge from "../components/ui/PrivacyBadge"
import { spacing, textSize, typography, layout, iconSize } from "../design-system"
import { ProductActionManager } from "../managers/ProductActionManager"
import { ChromeMessaging } from "../services/ChromeMessaging"
import type { Product } from "../storage"
import { storage } from "../storage"
import { extractProduct } from "../utils/productExtractor"

type ProductViewProps = {
  productId?: string | null
  marketplace: "amazon"
  onShowIDontNeedIt: (product: Product | null) => void
  onShowSleepOnIt: (product: Product | null) => void
  onShowINeedIt: () => void
  onClose: () => void
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  marginBottom: spacing.md,
  textAlign: "center",
  position: "relative"
}

const titleStyle: React.CSSProperties = {
  ...typography.titleLarge,
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm
}

const subtitleStyle: React.CSSProperties = {
  ...typography.subtitleLarge,
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm
}

const bodyStyle: React.CSSProperties = {
  ...layout.actionsContainer
}

const actionsStyle: React.CSSProperties = {
  ...layout.actionsContainer
}

const actionsGroupStyle: React.CSSProperties = {
  ...layout.actionsGroup
}

const ProductView = ({
  productId,
  marketplace,
  onShowIDontNeedIt,
  onShowSleepOnIt,
  onShowINeedIt,
  onClose
}: ProductViewProps) => {
  const [extractedProduct, setExtractedProduct] = useState<Product | null>(null)
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false)

  useEffect(() => {
    if (productId) {
      try {
        const product = extractProduct(marketplace, productId)
        setExtractedProduct(product)
      } catch (error) {
        console.error("[ProductView] Failed to extract product:", error)
        setExtractedProduct(null)
      }
    }
  }, [productId, marketplace])

  const handleSleepOnIt = () => {
    onShowSleepOnIt(extractedProduct)
  }

  const handleIDontNeedIt = async () => {
    if (extractedProduct) {
      try {
        await ProductActionManager.dontNeedIt(extractedProduct)
      } catch (error) {
        console.error("[ProductView] Failed to execute dontNeedIt:", error)
      }
    }
    onShowIDontNeedIt(extractedProduct)
  }

  const handleINeedIt = async () => {
    if (extractedProduct) {
      try {
        await ProductActionManager.needIt(extractedProduct)
      } catch (error) {
        console.error("[ProductView] Failed to execute needIt:", error)
      }
    }
    onShowINeedIt()
  }


  const handleCloseClick = () => {
    setShowPauseMenu(true)
  }

  const handlePauseMenuSelect = async (duration: PauseDuration) => {
    setShowPauseMenu(false)

    switch (duration) {
      case "close":
        // Just close for now - no snooze
        onClose()
        break
      case "30s":
        // Snooze for 30 seconds (debug only)
        // Note: We don't call onClose() here because the global snooze will hide the overlay
        // and we want it to reappear after the snooze expires
        try {
          const snoozedUntil = Date.now() + 30 * 1000
          await storage.setGlobalSnooze(snoozedUntil)
        } catch (error) {
          console.error("[ProductView] Failed to set 30 second snooze:", error)
        }
        break
      case "1hour":
        // Snooze for 1 hour
        // Note: We don't call onClose() here because the global snooze will hide the overlay
        // and we want it to reappear after the snooze expires
        try {
          const snoozedUntil = Date.now() + 60 * 60 * 1000
          await storage.setGlobalSnooze(snoozedUntil)
        } catch (error) {
          console.error("[ProductView] Failed to set 1 hour snooze:", error)
        }
        break
      case "1day":
        // Snooze for 1 day
        // Note: We don't call onClose() here because the global snooze will hide the overlay
        // and we want it to reappear after the snooze expires
        try {
          const snoozedUntil = Date.now() + 24 * 60 * 60 * 1000
          await storage.setGlobalSnooze(snoozedUntil)
        } catch (error) {
          console.error("[ProductView] Failed to set 1 day snooze:", error)
        }
        break
    }
  }

  const handlePauseMenuCancel = () => {
    setShowPauseMenu(false)
  }

  const handleInfoClick = () => {
    setShowPrivacyInfo(!showPrivacyInfo)
  }

  return (
    <Card footer={<PrivacyBadge />}>
      <Header
        onClose={handleCloseClick}
        onInfo={handleInfoClick}
        centerIcon={<h2 style={titleStyle}>ThinkTwice</h2>}
      />
      {showPauseMenu && (
        <PauseMenu
          onSelect={handlePauseMenuSelect}
          onCancel={handlePauseMenuCancel}
        />
      )}
      {showPrivacyInfo && (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: spacing.md,
            marginBottom: spacing.md,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: textSize.sm,
            lineHeight: "1.5"
          }}>
          <h3
            style={{
              margin: `0 0 ${spacing.xs} 0`,
              fontSize: textSize.md,
              color: "var(--primary-button-color)"
            }}>
            💡 Why ThinkTwice?
          </h3>
          <p style={{ margin: 0 }}>
            ThinkTwice is built to help you regain control over impulse
            spending.
            <strong> Your data is yours.</strong> Everything is stored{" "}
            <strong>locally</strong> in your browser. We never see, share, or
            sell your personal information or browsing history.
          </p>
          <button
            onClick={() => setShowPrivacyInfo(false)}
            style={{
              marginTop: spacing.sm,
              background: "none",
              border: "none",
              color: "var(--secondary-button-color)",
              cursor: "pointer",
              padding: 0,
              fontSize: textSize.xs,
              textDecoration: "underline"
            }}>
            Got it, thanks!
          </button>
        </div>
      )}
      <div style={headerStyle}>
        <p style={subtitleStyle}>
          <img
            src={lightbulbIcon}
            alt="lightbulb"
            style={{ width: iconSize.small, height: iconSize.small }}
          />
          Quick thought before you buy
        </p>
      </div>
      <div style={bodyStyle}>
        <Nudge />
        <div style={actionsStyle}>
          <Button
            variant="primary"
            icon={thoughtfulIcon}
            onClick={handleIDontNeedIt}>
            I don&apos;t really need it
          </Button>

          <div style={actionsGroupStyle}>
            <Button
              variant="secondary"
              icon={clockIcon}
              onClick={handleSleepOnIt}>
              Sleep on it
            </Button>
            <Button
              variant="tertiary"
              icon={trophyIcon}
              onClick={handleINeedIt}>
              I need it
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProductView
