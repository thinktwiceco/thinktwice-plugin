// Design System Variables
// Spacing scale (4px base unit)
export const spacing = {
  xs: "4px", // 4px
  sm: "8px", // 8px
  md: "12px", // 12px
  lg: "16px", // 16px
  xl: "20px", // 20px
  xxl: "24px" // 24px
} as const

// Text size scale
export const textSize = {
  xs: "10px", // 12px
  sm: "12px", // 14px
  md: "14px", // 16px
  lg: "16px", // 20px
  xl: "18px", // 24px
  xxl: "22px" // 28px
} as const

// Common spacing patterns
export const commonSpacing = {
  // Component padding
  cardPadding: spacing.xxl,
  buttonPadding: `${spacing.md} ${spacing.xxl}`,
  nudgePadding: spacing.lg,

  // Component margins
  sectionMargin: spacing.xxl,
  itemMargin: spacing.sm,

  // Gaps between elements
  smallGap: spacing.xs,
  mediumGap: spacing.md,
  largeGap: spacing.lg,
  xlargeGap: spacing.xl
} as const

// Typography styles
export const typography = {
  title: {
    fontSize: textSize.xl,
    fontWeight: "bold",
    color: "var(--text-color-light)",
    textAlign: "center" as const,
    margin: `0 0 ${spacing.md} 0`,
    lineHeight: "1.3"
  },
  titleLarge: {
    fontSize: textSize.xxl,
    fontWeight: "bold",
    color: "var(--text-color-light)",
    textAlign: "center" as const,
    margin: `0 0 ${spacing.md} 0`,
    lineHeight: "1.3"
  },
  subtitle: {
    fontSize: textSize.md,
    color: "var(--text-color-light)",
    textAlign: "center" as const,
    margin: `0 0 ${spacing.xxl} 0`,
    opacity: "0.9",
    lineHeight: "1.4"
  },
  subtitleLarge: {
    fontSize: textSize.lg,
    color: "var(--text-color-light)",
    textAlign: "center" as const,
    margin: `0 0 ${spacing.xxl} 0`,
    opacity: "0.8",
    lineHeight: "1.4"
  }
} as const

// Layout containers
export const layout = {
  actionsContainer: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: spacing.md
  },
  actionsGroup: {
    display: "flex" as const,
    gap: spacing.md
  },
  gridThreeColumn: {
    display: "grid" as const,
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center" as const
  }
} as const

// Icon sizes
export const iconSize = {
  small: "16px",
  medium: "20px",
  large: "35px"
} as const
