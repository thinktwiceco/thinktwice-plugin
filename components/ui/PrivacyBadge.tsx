import { iconSize, spacing, textSize } from "../../design-system"

const PrivacyBadge = () => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    opacity: 0.7,
    marginTop: spacing.md
  }

  const textStyle: React.CSSProperties = {
    fontSize: textSize.xs,
    color: "var(--text-color-light)",
    margin: 0,
    letterSpacing: "0.5px"
  }

  return (
    <div style={containerStyle}>
      <svg
        width={iconSize.small}
        height={iconSize.small}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-color-light)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p style={textStyle}>Private & Local: We don’t share or sell your data</p>
    </div>
  )
}

export default PrivacyBadge
