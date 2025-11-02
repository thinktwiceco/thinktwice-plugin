import React from "react"

import { commonSpacing, spacing } from "../../design-system"

type HeaderProps = {
  onBack?: () => void
  onClose?: () => void
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
  width: spacing.xxl,
  height: spacing.xxl,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none"
}

const backButtonStyle: React.CSSProperties = {
  ...baseContainerStyle,
  backgroundColor: "transparent",
  color: "var(--text-color-light)",
  cursor: "pointer"
}

const closeButtonStyle: React.CSSProperties = {
  ...baseContainerStyle,
  backgroundColor: "transparent",
  color: "var(--text-color-light)",
  cursor: "pointer"
}

const iconContainerStyle: React.CSSProperties = {
  ...baseContainerStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const Header = ({
  onBack,
  onClose,
  centerIcon,
  centerIconAlt
}: HeaderProps) => {
  return (
    <div style={headerStyle}>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
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
