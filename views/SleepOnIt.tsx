import { useState } from "react"
import moonIcon from "url:../assets/icons/Icons/Moon.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, textSize } from "../design-system"
import { ChromeMessaging } from "../services/ChromeMessaging"
import { storage } from "../storage"
import type { Product } from "../storage"

type SleepOnItProps = {
  onBack: () => void
  onClose?: () => void
  product: Product | null
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

const durationOptionsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: spacing.sm,
  marginBottom: spacing.lg
}

const durationButtonStyle: React.CSSProperties = {
  padding: spacing.md,
  borderRadius: "8px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  backgroundColor: "transparent",
  color: "var(--text-color-light)",
  fontSize: textSize.sm,
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease"
}

const durationButtonSelectedStyle: React.CSSProperties = {
  ...durationButtonStyle,
  border: "2px solid var(--primary-button-color)",
  backgroundColor: "rgba(104, 195, 212, 0.2)"
}

const successStyle: React.CSSProperties = {
  ...subtitleStyle,
  color: "var(--primary-button-color)",
  fontWeight: "600"
}

const SleepOnIt = ({ onBack, onClose, product }: SleepOnItProps) => {
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
      console.error("No product available")
      return
    }

    setSaving(true)
    try {
      console.log(
        "[SleepOnIt] Starting to save reminder for product:",
        product.id
      )
      console.log("[SleepOnIt] Product:", product)

      console.log("[SleepOnIt] Saving product with sleepingOnIt state...")
      await storage.saveProduct({ ...product, state: "sleepingOnIt" })
      console.log("[SleepOnIt] Product saved successfully")

      const reminder = {
        id: crypto.randomUUID(),
        productId: product.id,
        reminderTime: Date.now() + selectedDuration,
        duration: selectedDuration,
        status: "pending" as const
      }

      console.log("[SleepOnIt] Saving reminder...")
      await storage.saveReminder(reminder)
      console.log("[SleepOnIt] Reminder saved successfully")

      // Create alarm for reminder
      console.log("[SleepOnIt] Creating alarm for reminder...")
      try {
        await ChromeMessaging.createAlarm(reminder.id, reminder.reminderTime)
        console.log("[SleepOnIt] Alarm created successfully")
      } catch (error) {
        console.error("[SleepOnIt] Failed to create alarm:", error)
      }

      setSaved(true)
    } catch (error) {
      console.error("[SleepOnIt] Failed to save reminder:", error)
      alert("Failed to save reminder. Please check the console for details.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={
          <img
            src={moonIcon}
            alt="moon"
            style={{ width: "35px", height: "35px" }}
          />
        }
      />
      <h1 style={titleStyle}>Brilliant choice!</h1>
      <p style={subtitleStyle}>
        3 out of 4 people change their mind within 24 hours.
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
                style={
                  selectedDuration === option.value
                    ? durationButtonSelectedStyle
                    : durationButtonStyle
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
