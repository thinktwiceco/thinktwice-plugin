import { useEffect, useState } from "react"
import moonIcon from "url:../assets/icons/Icons/Moon.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import PrivacyBadge from "../components/ui/PrivacyBadge"
import { iconSize, spacing, typography } from "../design-system"
import { ProductActionManager } from "../managers/ProductActionManager"
import { ChromeMessaging } from "../services/ChromeMessaging"
import { storage } from "../storage"
import type { Product } from "../storage"

type SleepOnItProps = {
  onBack: () => void
  onClose?: () => void
  product: Product | null
  setPluginClosed: (closed: boolean) => void
}

const titleStyle: React.CSSProperties = {
  ...typography.title
}

const subtitleStyle: React.CSSProperties = {
  ...typography.subtitle
}

const durationOptionsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: spacing.sm,
  marginBottom: spacing.lg
}

const successStyle: React.CSSProperties = {
  ...typography.subtitle,
  color: "var(--primary-button-color)",
  fontWeight: "600"
}

const SleepOnIt = ({
  onBack,
  onClose,
  product,
  setPluginClosed: _setPluginClosed
}: SleepOnItProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(
    24 * 60 * 60 * 1000
  ) // Default: 24 hours
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const durationOptions = [
    { label: "1 minute", value: 1 * 60 * 1000 },
    { label: "1 hour", value: 1 * 60 * 60 * 1000 },
    { label: "6 hours", value: 6 * 60 * 60 * 1000 },
    { label: "24 hours", value: 24 * 60 * 60 * 1000 },
    { label: "3 days", value: 3 * 24 * 60 * 60 * 1000 },
    { label: "1 week", value: 7 * 24 * 60 * 60 * 1000 }
  ]

  const handleSaveReminder = async () => {
    if (!product) {
      console.error("[SleepOnIt] No product available")
      return
    }

    setSaving(true)
    try {
      console.log(
        "[SleepOnIt] Starting to save reminder for product:",
        product.id
      )

      // Generate reminder ID first
      const reminderId = crypto.randomUUID()
      console.log("[SleepOnIt] Generated reminder ID:", reminderId)

      // Mark this reminder as just created in the tab session state BEFORE saving
      // This prevents the early return view from appearing immediately
      const tabId = await ChromeMessaging.getTabId()
      await storage.saveTabSessionState({
        tabId,
        justCreatedReminderId: reminderId
      })
      console.log(
        "[SleepOnIt] Marked reminder as just created in session state"
      )

      // Now save the reminder with the pre-generated ID
      await ProductActionManager.sleepOnIt(
        product,
        selectedDuration,
        reminderId
      )
      console.log("[SleepOnIt] Reminder saved successfully")

      setSaved(true)
    } catch (error) {
      console.error("[SleepOnIt] Failed to save reminder:", error)
      alert("Failed to save reminder. Please check the console for details.")
    } finally {
      setSaving(false)
    }
  }

  // Auto-close tab after 4 seconds when reminder is saved
  useEffect(() => {
    if (saved) {
      console.log(
        "[SleepOnIt] Reminder saved, scheduling tab close in 4 seconds..."
      )
      const timer = setTimeout(async () => {
        console.log("[SleepOnIt] Requesting tab close...")

        try {
          await ChromeMessaging.closeCurrentTab()
          console.log("[SleepOnIt] Tab close request successful")
        } catch (error) {
          console.error("[SleepOnIt] Tab close failed:", error)
          // Fallback: hide the overlay
          if (onClose) {
            onClose()
          }
        }
      }, 4000) // 4 seconds

      return () => clearTimeout(timer)
    }
  }, [saved, onClose])

  return (
    <Card footer={<PrivacyBadge />}>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={
          <img
            src={moonIcon}
            alt="moon"
            style={{ width: iconSize.large, height: iconSize.large }}
          />
        }
      />
      <h1 style={titleStyle}>Brilliant choice!</h1>
      <p style={subtitleStyle}>
        Taking time to think is a superpower. How long would you like to wait?
      </p>

      {!saved ? (
        <>
          <p style={{ ...subtitleStyle, marginBottom: spacing.md }}>
            For how long you would like to think about this purchase?
          </p>
          <div style={durationOptionsStyle}>
            {durationOptions.map((option) => (
              <button
                key={option.value}
                className={
                  selectedDuration === option.value
                    ? "option-button option-button-selected"
                    : "option-button"
                }
                onClick={() => setSelectedDuration(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            onClick={handleSaveReminder}
            disabled={saving}>
            {saving ? "Saving..." : "Set Reminder"}
          </Button>
        </>
      ) : (
        <p style={successStyle}>
          ✓ Reminder saved! Hold tight and remember about the goal!
        </p>
      )}
    </Card>
  )
}

export default SleepOnIt
