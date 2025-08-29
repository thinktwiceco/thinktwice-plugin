import { spacing, commonSpacing, textSize } from "../../design-system"

const Error = ({ message }) => {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: commonSpacing.cardPadding,
    textAlign: "center",
    gap: spacing.md,
    backgroundColor: "var(--error-background-color)",
    borderRadius: "12px",
  }

  const messageStyle: React.CSSProperties = {
    fontSize: textSize.sm,
    lineHeight: "1.4",
    margin: "0",
    color: "var(--error-color)",
  }

  return (
    <div style={style}>
      <p style={messageStyle}>⚠️ {message}</p>
    </div>
  )
}

export default Error
