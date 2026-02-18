import { commonSpacing, spacing, textSize } from "../../design-system"

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  variant:
    | "primary"
    | "primaryEmphasized"
    | "secondary"
    | "tertiary"
    | "disabled"
  icon?: string
  iconSize?: string
  disabled?: boolean
}

const Button = ({
  children,
  onClick,
  variant,
  icon,
  iconSize: iconSizeProp,
  disabled
}: ButtonProps) => {
  const getButtonStyle = (variant, isDisabled) => {
    const baseStyle: React.CSSProperties = {
      borderRadius: "9999px",
      border: "none",
      padding: commonSpacing.buttonPadding,
      fontSize: textSize.md,
      minHeight: "48px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
      justifyContent: "center",
      fontWeight: "550",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: "var(--primary-button-color)",
          color: "#065F46"
        }
      case "primaryEmphasized":
        return {
          ...baseStyle,
          backgroundColor: "var(--primary-button-color)",
          color: "#044d3a",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.22)",
          padding: `${spacing.md} ${spacing.xxl}`,
          fontSize: textSize.lg
        }
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: "var(--secondary-button-color)",
          color: "#36497f"
        }
      case "tertiary":
        return {
          ...baseStyle,
          backgroundColor: "var(--tertiary-button-color)",
          color: "#7F1D1D",
          whiteSpace: "nowrap"
        }
      case "disabled":
        return {
          ...baseStyle,
          backgroundColor: "#cccccc",
          color: "#666666",
          cursor: "not-allowed"
        }
      default:
        return baseStyle
    }
  }

  const buttonStyle = getButtonStyle(variant, disabled)
  const handleClick = disabled ? undefined : onClick

  return (
    <button
      className="hover-highlight"
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled}>
      {icon && (
        <img
          src={icon}
          alt="icon"
          style={{
            width: iconSizeProp ?? "24px",
            height: iconSizeProp ?? "24px"
          }}
        />
      )}
      {children}
    </button>
  )
}

Button.defaultProps = {
  onClick: () => {},
  disabled: false
}

export default Button
