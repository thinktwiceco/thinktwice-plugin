import { spacing, textSize } from "../../design-system"

const skeletonButtonStyle: React.CSSProperties = {
  width: "100%",
  height: "60px",
  backgroundColor: "var(--background-color-secondary)",
  borderRadius: spacing.sm,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  position: "relative",
  overflow: "hidden"
}

const shimmerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: "-100%",
  width: "100%",
  height: "100%",
  background:
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
  animation: "shimmer 2s infinite"
}

const skeletonTextStyle: React.CSSProperties = {
  height: textSize.sm,
  backgroundColor: "var(--text-color-light)",
  borderRadius: spacing.xs,
  opacity: "0.3",
  position: "relative",
  overflow: "hidden"
}

const skeletonSubtextStyle: React.CSSProperties = {
  height: textSize.xs,
  backgroundColor: "var(--text-color-light)",
  borderRadius: spacing.xs,
  opacity: "0.2",
  width: "80%",
  position: "relative",
  overflow: "hidden"
}

const skeletonContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  width: "100%"
}

const Skeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
      <div style={skeletonContainerStyle}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} style={skeletonButtonStyle}>
            <div style={shimmerStyle} />
            <div style={skeletonTextStyle}>
              <div style={shimmerStyle} />
            </div>
            <div style={skeletonSubtextStyle}>
              <div style={shimmerStyle} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Skeleton
