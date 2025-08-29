import Card from "../components/ui/Card"
import Header from "../components/ui/Header"

import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"
import { spacing, commonSpacing, textSize } from "../design-system"
import { type Item } from "./ProductView"

type INeedItProps = {
  item: Item
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

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: 0,
  opacity: "0.9",
  lineHeight: "1.4",
}

const INeedIt = ({ item, onBack, onClose }: INeedItProps) => {
  return (
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={<img src={trophyIcon} alt="trophy" style={{ width: '35px', height: '35px' }} />}
        centerIconAlt="trophy"
      />
      
      <h1 style={titleStyle}>Trusting yourself is powerful.</h1>
      <p style={subtitleStyle}>Enjoy your new purchase.</p>
    </Card>
  )
}

export default INeedIt
