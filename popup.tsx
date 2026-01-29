import { useStorage } from "./hooks/useStorage"
import { ProductActionManager } from "./managers/ProductActionManager"
import { ChromeMessaging } from "./services/ChromeMessaging"
import type { Product, Reminder } from "./storage"
import { ProductState } from "./storage/types"

const containerStyle: React.CSSProperties = {
  width: "400px",
  minHeight: "300px",
  padding: "16px",
  fontFamily: "system-ui, -apple-system, sans-serif"
}

const headerStyle: React.CSSProperties = {
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "2px solid var(--popup-border)"
}

const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  color: "var(--popup-text-primary)"
}

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--popup-text-secondary)",
  margin: 0
}

const sectionStyle: React.CSSProperties = {
  marginBottom: "24px"
}

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "1px solid var(--popup-border)"
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "var(--popup-text-primary)",
  margin: 0
}

const totalSavingsStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "var(--popup-success-color)",
  margin: 0
}

const encouragingMessageStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--popup-text-secondary)",
  fontStyle: "italic",
  marginTop: "4px",
  marginBottom: "12px"
}

const reminderCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  padding: "12px",
  marginBottom: "12px",
  backgroundColor: "var(--popup-card-background)",
  borderRadius: "8px",
  border: "1px solid var(--popup-border)"
}

const reminderImageStyle: React.CSSProperties = {
  width: "60px",
  height: "60px",
  objectFit: "contain",
  borderRadius: "4px",
  flexShrink: 0
}

const reminderContentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "4px"
}

const reminderTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "var(--popup-text-primary)",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical"
}

const reminderTimeStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--popup-text-secondary)",
  margin: 0
}

const reminderActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginTop: "8px"
}

const buttonStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "500",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease"
}

const changedMindButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "var(--popup-button-background)",
  color: "var(--popup-button-text)"
}

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  color: "var(--popup-text-secondary)"
}

const loadingStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  color: "var(--popup-text-secondary)"
}

const snoozeContainerStyle: React.CSSProperties = {
  backgroundColor: "var(--popup-card-background)",
  border: "1px solid var(--popup-border)",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px"
}

const snoozeTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--popup-text-primary)",
  margin: 0,
  flex: 1
}

const snoozeTimeStyle: React.CSSProperties = {
  fontWeight: "600",
  color: "var(--popup-text-secondary)"
}

const removeSnoozeButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "500",
  borderRadius: "6px",
  border: "1px solid var(--popup-border)",
  backgroundColor: "var(--popup-button-background)",
  color: "var(--popup-button-text)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap"
}

const pluginDisabledContainerStyle: React.CSSProperties = {
  backgroundColor: "var(--popup-card-background)",
  border: "2px solid var(--popup-border)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px"
}

const pluginDisabledTextStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "600",
  color: "var(--popup-text-primary)",
  margin: 0,
  textAlign: "center"
}

const enablePluginButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "var(--popup-button-background)",
  color: "var(--popup-button-text)",
  cursor: "pointer",
  transition: "all 0.2s ease"
}

function IndexPopup() {
  const {
    reminders,
    products,
    snoozeUntil,
    globalPluginClosed,
    loading,
    clearSnooze,
    enablePlugin
  } = useStorage()

  console.log("---- ALL PRODUCTS ----", products)

  const formatTimeRemaining = (reminderTime: number): string => {
    const now = Date.now()
    const diff = reminderTime - now

    if (diff <= 0) {
      return "Now"
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `in ${days} day${days !== 1 ? "s" : ""}`
    } else if (hours > 0) {
      return `in ${hours} hour${hours !== 1 ? "s" : ""}`
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`
    }
  }

  const formatSnoozeTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })

    if (isToday) {
      return timeString
    }

    const dateString = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })

    return `${dateString} at ${timeString}`
  }

  const handleRemoveSnooze = async () => {
    try {
      await clearSnooze()
    } catch (error) {
      console.error("[Popup] Failed to remove snooze:", error)
    }
  }

  const handleEnablePlugin = async () => {
    try {
      await enablePlugin()
    } catch (error) {
      console.error("[Popup] Failed to enable plugin:", error)
    }
  }

  const parsePrice = (priceString: string | null): number => {
    if (!priceString) return 0
    const match = priceString.match(/[\d,]+\.?\d*/g)
    if (!match) return 0
    return parseFloat(match[0].replace(/,/g, ""))
  }

  const formatMoney = (amount: number): string => {
    return `$${amount.toFixed(2)}`
  }

  const handleChangedMind = async (
    reminderId: string,
    productId: string,
    productUrl: string
  ) => {
    try {
      await ProductActionManager.changedMyMind(productId, reminderId)
      console.log("[Popup] Changed mind - reminder and product state updated")
    } catch (error) {
      console.error("[Popup] Failed to execute changedMyMind:", error)
    }
    await ChromeMessaging.createTab(productUrl)
  }

  const pendingReminders = reminders.filter((r) => r.status === "pending")
  const now = Date.now()

  const sleepingOnItItems = pendingReminders.filter((r) => r.reminderTime > now)
  const achievementProducts = Object.values(products).filter(
    (p) => p.state === ProductState.DONT_NEED_IT
  )

  const sleepingOnItTotal = sleepingOnItItems.reduce((sum, reminder) => {
    const product = products[reminder.productId]
    return sum + parsePrice(product?.price || null)
  }, 0)

  const achievementsTotal = achievementProducts.reduce((sum, product) => {
    return sum + parsePrice(product?.price || null)
  }, 0)

  const renderReminderCard = (reminder: Reminder, isAchievement: boolean) => {
    const product = products[reminder.productId]
    if (!product) return null

    return (
      <div key={reminder.id} style={reminderCardStyle}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            style={reminderImageStyle}
          />
        )}
        <div style={reminderContentStyle}>
          <h3 style={reminderTitleStyle}>{product.name}</h3>
          {product.price && (
            <p style={reminderTimeStyle}>Price: {product.price}</p>
          )}
          {!isAchievement && (
            <p style={reminderTimeStyle}>
              Reminder: {formatTimeRemaining(reminder.reminderTime)}
            </p>
          )}
          <div style={reminderActionsStyle}>
            <button
              style={changedMindButtonStyle}
              onClick={() =>
                handleChangedMind(reminder.id, reminder.productId, product.url)
              }>
              I changed my mind
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderProductCard = (product: Product) => {
    return (
      <div key={product.id} style={reminderCardStyle}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            style={reminderImageStyle}
          />
        )}
        <div style={reminderContentStyle}>
          <h3 style={reminderTitleStyle}>{product.name}</h3>
          {product.price && (
            <p style={reminderTimeStyle}>Price: {product.price}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>ThinkTwice</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline"
          }}>
          <p style={subtitleStyle}>Your impulse control journey</p>
          <p style={{ ...subtitleStyle, fontSize: "10px", opacity: 0.6 }}>
            🔒 Private & Local
          </p>
        </div>
      </div>

      {globalPluginClosed && (
        <div style={pluginDisabledContainerStyle}>
          <p style={pluginDisabledTextStyle}>🔴 Plugin is currently disabled</p>
          <button
            style={enablePluginButtonStyle}
            onClick={handleEnablePlugin}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--button-secondary-hover-bg)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--popup-button-background)"
            }}>
            Re-enable ThinkTwice
          </button>
        </div>
      )}

      {snoozeUntil && snoozeUntil > Date.now() && (
        <div style={snoozeContainerStyle}>
          <p style={snoozeTextStyle}>
            ⏸️ Snoozed until{" "}
            <span style={snoozeTimeStyle}>{formatSnoozeTime(snoozeUntil)}</span>
          </p>
          <button
            style={removeSnoozeButtonStyle}
            onClick={handleRemoveSnooze}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--button-secondary-hover-bg)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--popup-button-background)"
            }}>
            Remove Snooze
          </button>
        </div>
      )}

      {loading ? (
        <div style={loadingStyle}>Loading...</div>
      ) : pendingReminders.length === 0 && achievementProducts.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>💭</div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
            No items yet
          </div>
          <div style={{ fontSize: "14px" }}>
            The more you DON&apos;T buy, the more you SAVE, the more you
            DON&apos;T need it!
          </div>
        </div>
      ) : (
        <>
          {sleepingOnItItems.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <h3 style={sectionTitleStyle}>Sleeping on it</h3>
                <span style={totalSavingsStyle}>
                  Saving: {formatMoney(sleepingOnItTotal)}
                </span>
              </div>
              <p style={encouragingMessageStyle}>You can do this! 💪</p>
              {sleepingOnItItems.map((reminder) =>
                renderReminderCard(reminder, false)
              )}
            </div>
          )}

          {achievementProducts.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <h3 style={sectionTitleStyle}>
                  Achievements - You resisted! 🎉
                </h3>
                <span style={totalSavingsStyle}>
                  Saved: {formatMoney(achievementsTotal)}
                </span>
              </div>
              {achievementProducts.map((product) => renderProductCard(product))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default IndexPopup
