import { useEffect } from "react"

import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import PrivacyBadge from "../components/ui/PrivacyBadge"
import { iconSize, typography } from "../design-system"

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
  ...typography.title
}

const subtitleStyle: React.CSSProperties = {
  ...typography.subtitle,
  margin: 0
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
            style={{ width: iconSize.large, height: iconSize.large }}
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
