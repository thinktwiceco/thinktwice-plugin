import { commonSpacing } from "../../design-system"

const Card = ({ children }) => {
  const style: React.CSSProperties = {
    backgroundColor: "var(--background-color)",
    borderRadius: "16px",
    padding: commonSpacing.cardPadding,
    color: "var(--text-color-light)",
    width: "100%",
    boxSizing: "border-box",
  }

  return <div style={style}>{children}</div>
}

export default Card

