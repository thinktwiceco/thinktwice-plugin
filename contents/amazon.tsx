import styleText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoGetOverlayAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useState } from "react"

import { useGoogleFonts } from "~/hooks/useGoogleFonts"
import { useProductPageState } from "~/hooks/useProductPageState"
import { ProductActionManager } from "~/managers/ProductActionManager"
import type { Product } from "~/storage"
import BackToAnOldFlame from "~/views/BackToAnOldFlame"
import CelebrateThoughtfulPurchase from "~/views/CelebrateThoughtfulPurchase"
import EarlyReturnFromSleep from "~/views/EarlyReturnFromSleep"
import IDontNeedIt from "~/views/IDontNeedIt"
import INeedIt from "~/views/INeedIt"
import ProductView from "~/views/ProductView"
import SleepOnIt from "~/views/SleepOnIt"

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
  const [localView, setLocalView] = useState<
    "product" | "idontneedit" | "sleeponit" | "ineedit" | "thoughtfulpurchase"
  >("product")
  const [localProduct, setLocalProduct] = useState<Product | null>(null)

  // Use custom hooks
  useGoogleFonts()
  const {
    currentView: reminderView,
    currentProduct,
    reminderId,
    reminderStartTime,
    hideOverlay,
    pluginClosed,
    setPluginClosed
  } = useProductPageState({
    getProductId: getAmazonProductId,
    marketplace: MARKETPLACE
  })

  // Determine the final view (reminder view takes precedence)
  const currentView = reminderView || localView

  const handleBackToProduct = () => {
    setLocalView("product")
  }

  const handleShowIDontNeedIt = async (product: Product | null) => {
    // Update product state to dontNeedIt
    if (product) {
      try {
        await ProductActionManager.dontNeedIt(product)
        console.log("[Amazon] Product marked as dontNeedIt")
      } catch (error) {
        console.error("[Amazon] Failed to execute dontNeedIt:", error)
      }
    }
    setLocalView("idontneedit")
  }

  const handleShowSleepOnIt = (product: Product | null) => {
    setLocalProduct(product)
    setLocalView("sleeponit")
  }

  const handleShowINeedIt = () => {
    setLocalView("ineedit")
  }

  const handleShowThoughtfulPurchase = () => {
    setLocalView("thoughtfulpurchase")
  }

  // Allow "ineedit" view to show even if hideOverlay is true
  // (this allows the celebration to display before auto-closing)
  const shouldShowOverlay =
    (!hideOverlay && !pluginClosed) || currentView === "ineedit"

  console.log("[PLUGIN CLOSED] Should show overlay:", shouldShowOverlay, {
    hideOverlay,
    pluginClosed,
    currentView
  })
  // If hideOverlay is true and we're not showing the ineedit view, don't render anything
  if (!shouldShowOverlay) {
    return null
  }

  for (const regex of amazonMatches) {
    if (regex.test(window.location.href)) {
      // Extract product ID from URL
      const url = window.location.href
      const productId = getAmazonProductId(url)

      if (currentView === "earlyreturn") {
        return (
          <EarlyReturnFromSleep
            product={currentProduct}
            reminderId={reminderId || ""}
            reminderStartTime={reminderStartTime || 0}
            onShowINeedIt={handleShowINeedIt}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === "oldflame") {
        return (
          <BackToAnOldFlame
            product={currentProduct}
            reminderId={reminderId || ""}
            reminderStartTime={reminderStartTime || 0}
            onShowThoughtfulPurchase={handleShowThoughtfulPurchase}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === "thoughtfulpurchase") {
        return <CelebrateThoughtfulPurchase onClose={handleBackToProduct} />
      }

      if (currentView === "idontneedit") {
        return (
          <IDontNeedIt
            onBack={handleBackToProduct}
            onClose={() => setPluginClosed(true)}
          />
        )
      }

      if (currentView === "sleeponit") {
        return (
          <SleepOnIt
            onBack={handleBackToProduct}
            onClose={() => setPluginClosed(true)}
            product={localProduct}
          />
        )
      }

      if (currentView === "ineedit") {
        return (
          <INeedIt
            onBack={handleBackToProduct}
            onClose={() => setPluginClosed(true)}
          />
        )
      }

      return (
        <ProductView
          productId={productId}
          marketplace={MARKETPLACE}
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
