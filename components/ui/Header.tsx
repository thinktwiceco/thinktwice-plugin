import React from "react"

import { commonSpacing, spacing } from "../../design-system"

type HeaderProps = {
  onBack?: () => void
  onClose?: () => void
  onInfo?: () => void
  centerIcon?: string | React.ReactNode
  centerIconAlt?: string
}

const headerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  alignItems: "center",
  marginBottom: commonSpacing.itemMargin
}

const baseContainerStyle: React.CSSProperties = {
  padding: spacing.xs,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  transition: "background-color 0.2s ease"
}

const backButtonStyle: React.CSSProperties = {
  ...baseContainerStyle,
  width: spacing.xxl,
  height: spacing.xxl,
  backgroundColor: "transparent",
  color: "var(--text-color-light)",
  cursor: "pointer"
}

const closeButtonStyle: React.CSSProperties = {
  ...baseContainerStyle,
  width: spacing.xxl,
  height: spacing.xxl,
  backgroundColor: "transparent",
  color: "var(--text-color-light)",
  cursor: "pointer"
}

const infoButtonStyle: React.CSSProperties = {
  ...baseContainerStyle,
  width: spacing.xl,
  height: spacing.xl,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "var(--text-color-light)",
  cursor: "pointer",
  marginLeft: spacing.xs
}

const iconContainerStyle: React.CSSProperties = {
  ...baseContainerStyle,
  width: spacing.xxl,
  height: spacing.xxl,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const Header = ({
  onBack,
  onClose,
  onInfo,
  centerIcon,
  centerIconAlt
}: HeaderProps) => {
  return (
    <div style={headerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center"
        }}>
        {onBack && (
          <button style={backButtonStyle} onClick={onBack}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-color-light)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onInfo && (
          <button
            style={infoButtonStyle}
            onClick={onInfo}
            title="Why ThinkTwice? (Privacy Info)">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {centerIcon && (
          <div style={iconContainerStyle}>
            {typeof centerIcon === "string" ? (
              <img
                src={centerIcon}
                alt={centerIconAlt || "icon"}
                style={{ width: "20px", height: "20px" }}
              />
            ) : (
              centerIcon
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {onClose && (
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
