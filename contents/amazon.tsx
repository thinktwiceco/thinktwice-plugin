import type { PlasmoCSConfig, PlasmoGetOverlayAnchor, PlasmoGetRootContainer, PlasmoGetStyle } from "plasmo"
import ProductView from "~/views/ProductView"
import ProductAlternatives from "~/views/ProductAlternatives"
import ItemAlternativesSources from "~/views/ItemAlternativesSources"
import IDontNeedIt from "~/views/IDontNeedIt"
import SleepOnIt from "~/views/SleepOnIt"
import INeedIt from "~/views/INeedIt"
import styleText from "data-text:~style.css"
import { Fingerprints } from "~scripts/fingerprints"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import type { Item } from "~/views/ProductView"
import type { AlternativeType } from "~/views/ProductAlternatives"

export const config: PlasmoCSConfig = {
  matches: ["*://*.amazon.com/*"],
}

const amazonMatches = [
  /\/dp\/|\/gp\/product\//,
]

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = () => {
  return document.body
}

const App = () => {
  const [currentView, setCurrentView] = useState<'product' | 'alternatives' | 'idontneedit' | 'sleeponit' | 'ineedit'>('product')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [expandedAlternativeId, setExpandedAlternativeId] = useState<number | null>(null)

  useEffect(() => {
    const tracker = new Fingerprints()
    tracker.saveSessionId(String(uuidv4()))
    const fingerprintsString = tracker.getFingerprints()
    tracker.saveFingerprints(fingerprintsString)

    return () => {
      tracker.clearSessionId()
    }
  }, [])

  const handleShowAlternatives = (item: Item) => {
    setSelectedItem(item)
    setCurrentView('alternatives')
    setExpandedAlternativeId(null)
  }

  const handleSelectAlternativeSource = (alternativeId: number) => {
    setExpandedAlternativeId(expandedAlternativeId === alternativeId ? null : alternativeId)
  }

  const handleBackToProduct = () => {
    setCurrentView('product')
    setSelectedItem(null)
    setExpandedAlternativeId(null)
  }

  const handleShowIDontNeedIt = () => {
    setCurrentView('idontneedit')
  }

  const handleShowSleepOnIt = (item: Item) => {
    setSelectedItem(item)
    setCurrentView('sleeponit')
  }

  const handleShowINeedIt = (item: Item) => {
    setSelectedItem(item)
    setCurrentView('ineedit')
  }

  for (const regex of amazonMatches) {
    if (regex.test(window.location.href)) {      
      // Extract product ID from URL
      const url = window.location.href
      let productId = null

      // Match /dp/PRODUCT_ID/ or /gp/product/PRODUCT_ID/
      const dpMatch = url.match(/\/dp\/([A-Z0-9]+)/)
      const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]+)/)

      if (dpMatch) {
        productId = dpMatch[1]
      } else if (gpMatch) {
        productId = gpMatch[1]
      }

      if (currentView === 'alternatives' && selectedItem) {
        return (
          <ProductAlternatives 
            item={selectedItem} 
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
            onSelectAlternative={handleSelectAlternativeSource}
            expandedAlternativeId={expandedAlternativeId}
          />
        )
      }

      if (currentView === 'idontneedit') {
        return (
          <IDontNeedIt
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === 'sleeponit' && selectedItem) {
        return (
          <SleepOnIt
            item={selectedItem}
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
            onShowAlternatives={handleShowAlternatives}
          />
        )
      }

      if (currentView === 'ineedit' && selectedItem) {
        return (
          <INeedIt 
            item={selectedItem}
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
          />
        )
      }

      return (
        <ProductView 
          url={window.location.href} 
          productId={productId} 
          marketplace="amazon" 
          onShowAlternatives={handleShowAlternatives}
          onShowIDontNeedIt={handleShowIDontNeedIt}
          onShowSleepOnIt={handleShowSleepOnIt}
          onShowINeedIt={handleShowINeedIt}
        />
      )
    }
  }

  return null
}

export default App

