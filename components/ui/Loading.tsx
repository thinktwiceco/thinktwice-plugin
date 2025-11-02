import { commonSpacing, spacing, textSize } from "../../design-system"

type LoadingProps = {
  message?: string
}

const Loading = ({ message }: LoadingProps) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: commonSpacing.cardPadding,
    gap: spacing.md
  }

  const spinnerStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    border: "3px solid var(--background-color)",
    borderTop: "3px solid var(--primary-button-color)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }

  const textStyle: React.CSSProperties = {
    fontSize: textSize.sm,
    color: "var(--text-color-light)",
    margin: "0"
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>{message || "Loading..."}</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default Loading
