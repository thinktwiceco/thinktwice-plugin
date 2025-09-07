import { spacing, textSize } from "../../design-system"

interface RefurbishedIconProps {
  size?: number
  color?: string
  backgroundColor?: string
}

const RefurbishedIcon = ({ 
  size = 60, 
  color = "white", 
  backgroundColor = "var(--primary-button-color)" 
}: RefurbishedIconProps) => {
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
    position: "relative",
  }

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    fontSize: `${size * 0.3}px`,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  }

  return (
    <div style={iconStyle}>
      <span style={arrowStyle}>♻</span>
    </div>
  )
}

export default RefurbishedIcon
