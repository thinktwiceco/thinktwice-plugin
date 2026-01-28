import React from "react"

import { spacing, textSize } from "../../design-system"

export type PauseDuration = "close" | "5min" | "1hour" | "1day"

type PauseMenuProps = {
  onSelect: (duration: PauseDuration) => void
  onCancel: () => void
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000
}

const menuStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: spacing.lg,
  minWidth: "280px",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "column",
  gap: spacing.md
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "600",
  margin: 0,
  color: "#1a1a1a",
  textAlign: "center"
}

const optionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm
}

const optionButtonStyle: React.CSSProperties = {
  padding: `${spacing.md} ${spacing.lg}`,
  backgroundColor: "#f5f5f5",
  color: "#1a1a1a",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: textSize.md,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s ease",
  fontFamily: "inherit"
}

const cancelButtonStyle: React.CSSProperties = {
  ...optionButtonStyle,
  backgroundColor: "transparent",
  color: "#666666",
  textAlign: "center",
  marginTop: spacing.sm
}

const PauseMenu = ({ onSelect, onCancel }: PauseMenuProps) => {
  const handleSelect = (duration: PauseDuration) => {
    onSelect(duration)
  }

  // Check if we're in development/debug mode
  const isDebugMode = process.env.NODE_ENV === "development"

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>Pause notifications?</h3>
        <div style={optionsStyle}>
          <button
            style={optionButtonStyle}
            onClick={() => handleSelect("close")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8e8e8"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
            Close for now
          </button>
          {isDebugMode && (
            <button
              style={optionButtonStyle}
              onClick={() => handleSelect("5min")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e8e8e8"
                e.currentTarget.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5"
                e.currentTarget.style.transform = "translateY(0)"
              }}>
              🐛 Pause for 5 minutes (debug)
            </button>
          )}
          <button
            style={optionButtonStyle}
            onClick={() => handleSelect("1hour")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8e8e8"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
            Pause for 1 hour
          </button>
          <button
            style={optionButtonStyle}
            onClick={() => handleSelect("1day")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8e8e8"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
            Pause for 1 day
          </button>
        </div>
        <button style={cancelButtonStyle} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default PauseMenu
