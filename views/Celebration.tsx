import { useEffect } from "react"

import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import PrivacyBadge from "../components/ui/PrivacyBadge"
import { spacing, textSize } from "../design-system"

type CelebrationProps = {
  icon: string
  iconAlt?: string
  title: string
  subtitle?: string
  autoCloseDelay?: number | null
  onClose?: () => void
  onBack?: () => void
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.md} 0`,
  lineHeight: "1.3"
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: 0,
  opacity: "0.9",
  lineHeight: "1.4"
}

const Celebration = ({
  icon,
  iconAlt = "celebration",
  title,
  subtitle,
  autoCloseDelay = null,
  onClose,
  onBack
}: CelebrationProps) => {
  useEffect(() => {
    if (autoCloseDelay !== null && autoCloseDelay > 0 && onClose) {
      const timer = setTimeout(() => {
        console.log("[Celebration] Auto-closing after delay...")
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [autoCloseDelay, onClose])

  return (
    <Card footer={<PrivacyBadge />}>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={
          <img
            src={icon}
            alt={iconAlt}
            style={{ width: "35px", height: "35px" }}
          />
        }
        centerIconAlt={iconAlt}
      />

      <h1 style={titleStyle}>{title}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </Card>
  )
}

export default Celebration
