import { spacing, textSize } from "../../design-system"

interface DIYIconProps {
  size?: number
  color?: string
  backgroundColor?: string
}

const DIYIcon = ({
  size = 60,
  color = "white",
  backgroundColor = "var(--tertiary-button-color)"
}: DIYIconProps) => {
  const iconStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "8px",
    backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
    fontSize: textSize.lg,
    fontWeight: "bold",
    position: "relative"
  }

  const toolStyle: React.CSSProperties = {
    position: "absolute",
    fontSize: `${size * 0.3}px`,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  }

  return (
    <div style={iconStyle}>
      <span style={toolStyle}>🔧</span>
    </div>
  )
}

export default DIYIcon
