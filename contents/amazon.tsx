import styleText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoGetOverlayAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useState } from "react"

import { useGoogleFonts } from "~/hooks/useGoogleFonts"
import { useProductPageState } from "~/hooks/useProductPageState"
import type { Product } from "~/storage"
import BackToAnOldFlame from "~/views/BackToAnOldFlame"
import CelebrateThoughtfulPurchase from "~/views/CelebrateThoughtfulPurchase"
import EarlyReturnFromSleep from "~/views/EarlyReturnFromSleep"
import IDontNeedIt from "~/views/IDontNeedIt"
import INeedIt from "~/views/INeedIt"
import ProductView from "~/views/ProductView"
import SleepOnIt from "~/views/SleepOnIt"

// View constants
const VIEW = {
  PRODUCT: "product",
  I_DONT_NEED_IT: "idontneedit",
  SLEEP_ON_IT: "sleeponit",
  I_NEED_IT: "ineedit",
  THOUGHTFUL_PURCHASE: "thoughtfulpurchase",
  EARLY_RETURN: "earlyreturn",
  OLD_FLAME: "oldflame"
} as const

export const config: PlasmoCSConfig = {
  matches: ["*://*.amazon.com/*"]
}

const amazonMatches = [/\/dp\/|\/gp\/product\//]

const MARKETPLACE = "amazon"

/**
 * Extracts the Amazon product ID from a URL
 */
const getAmazonProductId = (url: string): string | null => {
  // Match /dp/PRODUCT_ID/ or /gp/product/PRODUCT_ID/
  const dpMatch = url.match(/\/dp\/([A-Z0-9]+)/)
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]+)/)

  if (dpMatch) {
    return dpMatch[1]
  } else if (gpMatch) {
    return gpMatch[1]
  }

  return null
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = () => {
  return document.body
}

const App = () => {
  const [localView, setLocalView] = useState<(typeof VIEW)[keyof typeof VIEW]>(
    VIEW.PRODUCT
  )
  const [localProduct, setLocalProduct] = useState<Product | null>(null)

  // Use custom hooks
  useGoogleFonts()
  const {
    currentView: reminderView,
    product,
    reminderId,
    reminderStartTime,
    pluginClosed,
    setPluginClosed
  } = useProductPageState({
    getProductId: getAmazonProductId,
    marketplace: MARKETPLACE
  })

  // Determine the final view (reminder view takes precedence)
  const currentView = reminderView || localView

  const handleBackToProduct = () => {
    setLocalView(VIEW.PRODUCT)
  }

  const handleShowIDontNeedIt = (_product: Product | null) => {
    setLocalView(VIEW.I_DONT_NEED_IT)
  }

  const handleShowSleepOnIt = (product: Product | null) => {
    setLocalProduct(product)
    setLocalView(VIEW.SLEEP_ON_IT)
  }

  const handleShowINeedIt = () => {
    setLocalView(VIEW.I_NEED_IT)
  }

  const handleShowThoughtfulPurchase = () => {
    setLocalView(VIEW.THOUGHTFUL_PURCHASE)
  }

  // Special case: Allow celebration views even when pluginClosed=true
  const shouldShowOverlay = !pluginClosed || currentView === VIEW.I_NEED_IT

  console.log("[PLUGIN CLOSED] Should show overlay:", shouldShowOverlay, {
    pluginClosed,
    currentView
  })

  if (!shouldShowOverlay) {
    return null
  }

  for (const regex of amazonMatches) {
    if (regex.test(window.location.href)) {
      // Extract product ID from URL
      const url = window.location.href
      const _productId = getAmazonProductId(url)

      if (currentView === VIEW.EARLY_RETURN) {
        return (
          <EarlyReturnFromSleep
            product={product}
            reminderId={reminderId || ""}
            reminderStartTime={reminderStartTime || 0}
            onShowINeedIt={handleShowINeedIt}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === VIEW.OLD_FLAME) {
        return (
          <BackToAnOldFlame
            product={product}
            reminderId={reminderId || ""}
            reminderStartTime={reminderStartTime || 0}
            onShowThoughtfulPurchase={handleShowThoughtfulPurchase}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === VIEW.THOUGHTFUL_PURCHASE) {
        return <CelebrateThoughtfulPurchase onClose={handleBackToProduct} />
      }

      if (currentView === VIEW.I_DONT_NEED_IT) {
        return (
          <IDontNeedIt
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === VIEW.SLEEP_ON_IT) {
        return (
          <SleepOnIt
            onBack={handleBackToProduct}
            onClose={() => setPluginClosed(true)}
            product={localProduct}
            setPluginClosed={setPluginClosed}
          />
        )
      }

      if (currentView === VIEW.I_NEED_IT) {
        return (
          <INeedIt onBack={handleBackToProduct} onClose={handleBackToProduct} />
        )
      }

      return (
        <ProductView
          product={product}
          onShowIDontNeedIt={handleShowIDontNeedIt}
          onShowSleepOnIt={handleShowSleepOnIt}
          onShowINeedIt={handleShowINeedIt}
          onClose={() => setPluginClosed(true)}
        />
      )
    }
  }

  return null
}

export default App
