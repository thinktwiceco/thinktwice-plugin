import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"

import starIcon from "url:../assets/icons/Icons/Star.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import moonIcon from "url:../assets/icons/Icons/Moon.svg"
import { spacing, commonSpacing, textSize } from "../design-system"
import { type Item } from "./ProductView"

type SleepOnItProps = {
  item: Item
  onBack: () => void
  onClose?: () => void
  onShowAlternatives: (item: Item) => void
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.md} 0`,
  lineHeight: "1.3",
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${commonSpacing.sectionMargin} 0`,
  opacity: "0.9",
  lineHeight: "1.4",
}

const iconContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.lg,
  position: "relative",
}

const mainIconStyle: React.CSSProperties = {
  width: "60px",
  height: "60px",
  backgroundColor: "#FFD700",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "bold",
  color: "#8B5CF6",
  position: "relative",
  zIndex: 2,
}

const starDecorationStyle: React.CSSProperties = {
  position: "absolute",
  width: "12px",
  height: "12px",
  zIndex: 1,
}

const SleepOnIt = ({ item, onBack, onClose, onShowAlternatives }: SleepOnItProps) => {
  return (
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={<img src={moonIcon} alt="moon" style={{ width: '35px', height: '35px' }} />}
      />
      <h1 style={titleStyle}>Brilliant choice!</h1>
      <p style={subtitleStyle}>3 out of 4 people change their mind within 24 hours.</p>

      <Button
        variant="primary"
        icon={lightbulbIcon}
        onClick={() => {
          onShowAlternatives(item)
        }}
      >
        Explore sustainable alternatives now
      </Button>
    </Card>
  )
}

export default SleepOnIt
