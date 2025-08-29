import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"

import starIcon from "url:../assets/icons/Icons/Star.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import { spacing, commonSpacing, textSize } from "../design-system"

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
  lineHeight: "1.3",
}

const questionStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${commonSpacing.sectionMargin} 0`,
  fontWeight: "500",
}

const optionsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  width: "100%",
  marginBottom: commonSpacing.sectionMargin,
}



const IDontNeedIt = ({ onBack, onClose }: IDontNeedItProps) => {
  const options = [
    {
      title: "Start investing",
      variant: "primary",
    },
    {
      title: "Learn how",
      variant: "primary",
    },
    {
      title: "Maybe later",
      variant: "primary",
    },
  ]

  return (
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={<img src={starIcon} alt="star" style={{ width: "35px", height: "35px" }} />}
        centerIconAlt="star"
      />
      
      <h1 style={titleStyle}>Great choice! You are building habits for a brighter future.</h1>
      <p style={questionStyle}>Do you want to grow the money you saved?</p>

      <div style={optionsContainerStyle}>
        {options.map((option, index) => (
          <div key={index}>
            <Button
              variant={option.variant}
              icon={null}
              onClick={() => {
                console.log(`Selected: ${option.title}`)
              }}
            >
              {option.title}
            </Button>
          </div>
        ))}
      </div>

      <div className="info-container">
        <img src={lightbulbIcon} alt="lightbulb" style={{ width: "20px", height: "20px", flexShrink: 0 }} />
        <p className="info-container-text">
          <strong>Did you know?</strong> Not saving enough is the #1 regret of retirees.
        </p>
      </div>
    </Card>
  )
}

export default IDontNeedIt
