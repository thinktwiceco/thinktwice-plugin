import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import starIcon from "url:../assets/icons/Icons/Star.svg"
import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import PrivacyBadge from "../components/ui/PrivacyBadge"
import { commonSpacing, spacing, textSize } from "../design-system"
import Celebration from "./Celebration"

// Feature flag: Set to true to show investment options view
const SHOW_INVESTMENT_OPTIONS = false

type IDontNeedItProps = {
  onBack: () => void
  onClose?: () => void
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.md} 0`,
  lineHeight: "1.3"
}

const questionStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${commonSpacing.sectionMargin} 0`,
  fontWeight: "500"
}

const optionsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  width: "100%",
  marginBottom: commonSpacing.sectionMargin
}

const IDontNeedIt = ({ onBack, onClose }: IDontNeedItProps) => {
  // When feature flag is disabled, show celebration instead of investment options
  if (!SHOW_INVESTMENT_OPTIONS) {
    return (
      <Celebration
        icon={trophyIcon}
        iconAlt="trophy"
        title="Well done for choosing not to buy! 🎉"
        subtitle="Your future self will thank you for being so thoughtful."
        autoCloseDelay={4000}
        onBack={onBack}
        onClose={onClose}
      />
    )
  }

  // Original investment options view (preserved for future use)
  const options = [
    {
      title: "Start investing",
      variant: "primary"
    },
    {
      title: "Learn how",
      variant: "primary"
    },
    {
      title: "Maybe later",
      variant: "primary"
    }
  ]

  return (
    <Card footer={<PrivacyBadge />}>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={
          <img
            src={starIcon}
            alt="star"
            style={{ width: "35px", height: "35px" }}
          />
        }
        centerIconAlt="star"
      />

      <h1 style={titleStyle}>
        Great choice! You are building habits for a brighter future.
      </h1>
      <p style={questionStyle}>Do you want to grow the money you saved?</p>

      <div style={optionsContainerStyle}>
        {options.map((option, index) => (
          <div key={index}>
            <Button
              variant={
                option.variant as
                  | "primary"
                  | "secondary"
                  | "tertiary"
                  | "disabled"
              }
              icon={null}
              onClick={() => {
                console.log(`Selected: ${option.title}`)
              }}>
              {option.title}
            </Button>
          </div>
        ))}
      </div>

      <div className="info-container">
        <img
          src={lightbulbIcon}
          alt="lightbulb"
          style={{ width: "20px", height: "20px", flexShrink: 0 }}
        />
        <p className="info-container-text">
          <strong>Did you know?</strong> Not saving enough is the #1 regret of
          retirees.
        </p>
      </div>
    </Card>
  )
}

export default IDontNeedIt
