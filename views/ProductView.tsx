import { useEffect, useState } from "react"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"
import trophyIcon from "url:../assets/icons/Icons/Trophy.png"

import Nudge from "../components/Nudge"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Header from "../components/ui/Header"
import { spacing, textSize } from "../design-system"
import { ProductActionManager } from "../managers/ProductActionManager"
import type { Product } from "../storage"
import { extractProduct } from "../utils/productExtractor"

type ProductViewProps = {
  productId?: string | null
  marketplace: "amazon"
  onShowIDontNeedIt: (product: Product | null) => void
  onShowSleepOnIt: (product: Product | null) => void
  onShowINeedIt: () => void
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  marginBottom: spacing.md,
  textAlign: "center",
  position: "relative"
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xxl,
  fontWeight: "bold",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  color: "var(--text-color-light)",
  opacity: "0.8",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm
}

const bodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md
}

const actionsGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: spacing.md
}

const ProductView = ({
  productId,
  marketplace,
  onShowIDontNeedIt,
  onShowSleepOnIt,
  onShowINeedIt
}: ProductViewProps) => {
  const [extractedProduct, setExtractedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (productId) {
      try {
        const product = extractProduct(marketplace, productId)
        setExtractedProduct(product)
      } catch (error) {
        console.error("[ProductView] Failed to extract product:", error)
        setExtractedProduct(null)
      }
    }
  }, [productId, marketplace])

  const handleSleepOnIt = () => {
    onShowSleepOnIt(extractedProduct)
  }

  const handleIDontNeedIt = async () => {
    if (extractedProduct) {
      try {
        await ProductActionManager.dontNeedIt(extractedProduct)
      } catch (error) {
        console.error("[ProductView] Failed to execute dontNeedIt:", error)
      }
    }
    onShowIDontNeedIt(extractedProduct)
  }

  const handleINeedIt = async () => {
    if (extractedProduct) {
      try {
        await ProductActionManager.needIt(extractedProduct.id)
      } catch (error) {
        console.error("[ProductView] Failed to execute needIt:", error)
      }
    }
    onShowINeedIt()
  }

  return (
    <Card>
      <Header
        onClose={() => {}}
        centerIcon={<h2 style={titleStyle}>ThinkTwice</h2>}
      />
      <div style={headerStyle}>
        <p style={subtitleStyle}>
          <img
            src={lightbulbIcon}
            alt="lightbulb"
            style={{ width: "16px", height: "16px" }}
          />
          Quick thought before you buy
        </p>
      </div>
      <div style={bodyStyle}>
        <Nudge />
        <div style={actionsStyle}>
          <Button
            variant="primary"
            icon={thoughtfulIcon}
            onClick={handleIDontNeedIt}>
            I don&apos;t really need it
          </Button>
          <div style={actionsGroupStyle}>
            <Button
              variant="secondary"
              icon={clockIcon}
              onClick={handleSleepOnIt}>
              Sleep on it
            </Button>
            <Button
              variant="tertiary"
              icon={trophyIcon}
              onClick={handleINeedIt}>
              I need it
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProductView
