import { commonSpacing, spacing } from "../../design-system"

const Card = ({
  children,
  footer
}: {
  children: React.ReactNode
  footer?: React.ReactNode
}) => {
  const style: React.CSSProperties = {
    backgroundColor: "var(--background-color)",
    borderRadius: "16px",
    padding: commonSpacing.cardPadding,
    color: "var(--text-color-light)",
    width: "100%",
    boxSizing: "border-box"
  }

  return (
    <div style={style}>
      {children}
      {footer && (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            marginTop: spacing.md,
            paddingTop: spacing.md
          }}>
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
