// Design System Variables
// Spacing scale (4px base unit)
export const spacing = {
  xs: "4px",    // 4px
  sm: "8px",    // 8px
  md: "12px",   // 12px
  lg: "16px",   // 16px
  xl: "20px",   // 20px
  xxl: "24px",  // 24px
} as const

// Text size scale
export const textSize = {
  xs: "10px",   // 12px
  sm: "12px",   // 14px
  md: "14px",   // 16px
  lg: "16px",   // 20px
  xl: "18px",   // 24px
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
  xlargeGap: spacing.xl,
} as const
