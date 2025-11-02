import { textSize } from "../../design-system"

interface RentBorrowIconProps {
  size?: number
  color?: string
  backgroundColor?: string
}

const RentBorrowIcon = ({
  size = 60,
  color = "white",
  backgroundColor = "var(--secondary-button-color)"
}: RentBorrowIconProps) => {
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

  const handshakeStyle: React.CSSProperties = {
    position: "absolute",
    fontSize: `${size * 0.3}px`,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  }

  return (
    <div style={iconStyle}>
      <span style={handshakeStyle}>🤝</span>
    </div>
  )
}

export default RentBorrowIcon
