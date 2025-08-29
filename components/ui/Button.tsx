import { commonSpacing, textSize, spacing } from "../../design-system"

const Button = ({ children, onClick, variant, icon }) => {
  const getButtonStyle = (variant) => {
    const baseStyle: React.CSSProperties = {
      borderRadius: "9999px",
      border: "none",
      padding: commonSpacing.buttonPadding,
      fontSize: textSize.md,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
      justifyContent: "center",
      fontWeight: "500",
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: "var(--primary-button-color)",
          color: "var(--text-color-dark)",
        }
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: "var(--secondary-button-color)",
          color: "var(--text-color-dark)",
        }
      case "tertiary":
        return {
          ...baseStyle,
          backgroundColor: "var(--tertiary-button-color)",
          color: "var(--text-color-dark)",
        }
      case "disabled":
        return {
          ...baseStyle,
          backgroundColor: "#cccccc",
          color: "#666666",
          cursor: "not-allowed",
        }
      default:
        return baseStyle
    }
  }

  const buttonStyle = getButtonStyle(variant)
  const handleClick = variant === "disabled" ? undefined : onClick

  return (
    <button className="hover-highlight" style={buttonStyle} onClick={handleClick}>
      {icon && <img src={icon} alt="icon" style={{ width: '20px', height: '20px' }} />}
      {children}
    </button>
  )
}

Button.defaultProps = {
  onClick: () => {}
}

export default Button

