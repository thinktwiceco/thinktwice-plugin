import { useStorage } from "./hooks/useStorage"

const containerStyle: React.CSSProperties = {
  width: "400px",
  minHeight: "300px",
  padding: "16px",
  fontFamily: "system-ui, -apple-system, sans-serif"
}

const headerStyle: React.CSSProperties = {
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "2px solid #E5E7EB"
}

const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  color: "#1F2937"
}

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6B7280",
  margin: 0
}

const reminderCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  padding: "12px",
  marginBottom: "12px",
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  border: "1px solid #E5E7EB"
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
  color: "#1F2937",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical"
}

const reminderTimeStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B7280",
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

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#8B5CF6",
  color: "white"
}

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#E5E7EB",
  color: "#374151"
}

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#6B7280"
}

const loadingStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#6B7280"
}

function IndexPopup() {
  const { reminders, products, loading, deleteReminder, updateReminder } = useStorage()

  const formatTimeRemaining = (reminderTime: number): string => {
    const now = Date.now()
    const diff = reminderTime - now

    if (diff <= 0) {
      return "Now"
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `in ${days} day${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
  }

  const handleOpenProduct = (productUrl: string) => {
    chrome.tabs.create({ url: productUrl })
  }

  const handleDismiss = async (reminderId: string) => {
    await updateReminder(reminderId, { status: 'dismissed' })
  }

  const pendingReminders = reminders.filter(r => r.status === 'pending')

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>ThinkTwice</h2>
        <p style={subtitleStyle}>Your saved reminders</p>
      </div>

      {loading ? (
        <div style={loadingStyle}>Loading reminders...</div>
      ) : pendingReminders.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>💭</div>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
            No reminders yet
          </div>
          <div style={{ fontSize: "14px" }}>
            Click "Sleep on it" on any Amazon product to save a reminder
          </div>
        </div>
      ) : (
        <div>
          {pendingReminders.map((reminder) => {
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
                  <p style={reminderTimeStyle}>
                    Reminder: {formatTimeRemaining(reminder.reminderTime)}
                  </p>
                  <div style={reminderActionsStyle}>
                    <button
                      style={primaryButtonStyle}
                      onClick={() => handleOpenProduct(product.url)}
                    >
                      Still interested
                    </button>
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => handleDismiss(reminder.id)}
                    >
                      Not interested
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default IndexPopup
