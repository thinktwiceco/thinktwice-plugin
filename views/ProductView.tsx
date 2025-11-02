import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"
import Nudge from "../components/Nudge"

import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"
import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"
import { spacing, commonSpacing, textSize } from "../design-system"

type ProductViewProps = {
  url: string
  productId?: string | null
  marketplace: "amazon"
  onShowIDontNeedIt: () => void
  onShowSleepOnIt: () => void
  onShowINeedIt: () => void
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  marginBottom: spacing.md,
  textAlign: "center",
  position: "relative",
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xxl,
  fontWeight: "bold",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  color: "var(--text-color-light)",
  opacity: "0.8",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
}

const bodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
}

const actionsGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: spacing.md,
}

const ProductView = ({ url, productId, marketplace, onShowIDontNeedIt, onShowSleepOnIt, onShowINeedIt }: ProductViewProps) => {
  return (
    <Card>
      <Header onClose={() => {}} centerIcon={<h2 style={titleStyle}>ThinkTwice</h2>} />
      <div style={headerStyle}>
        <p style={subtitleStyle}>
          <img src={lightbulbIcon} alt="lightbulb" style={{ width: '16px', height: '16px' }} />
          Quick thought before you buy
        </p>
      </div>
      <div style={bodyStyle}>
        <Nudge />
        <div style={actionsStyle}>
          <Button variant="primary" icon={thoughtfulIcon} onClick={onShowIDontNeedIt}>I don't really need it</Button>
          <div style={actionsGroupStyle}>
            <Button variant="secondary" icon={clockIcon} onClick={onShowSleepOnIt}>Sleep on it</Button>
            <Button variant="tertiary" icon={trophyIcon} onClick={onShowINeedIt}>I need it</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProductView

