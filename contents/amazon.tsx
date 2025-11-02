import type { PlasmoCSConfig, PlasmoGetOverlayAnchor, PlasmoGetStyle } from "plasmo"
import ProductView from "~/views/ProductView"
import IDontNeedIt from "~/views/IDontNeedIt"
import SleepOnIt from "~/views/SleepOnIt"
import INeedIt from "~/views/INeedIt"
import styleText from "data-text:~style.css"
import { useState, useEffect } from "react"

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
  const [currentView, setCurrentView] = useState<'product' | 'idontneedit' | 'sleeponit' | 'ineedit'>('product')

  // Inject Google Fonts link for Inter
  useEffect(() => {
    const linkId = 'plasmo-inter-font'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  const handleBackToProduct = () => {
    setCurrentView('product')
  }

  const handleShowIDontNeedIt = () => {
    setCurrentView('idontneedit')
  }

  const handleShowSleepOnIt = () => {
    setCurrentView('sleeponit')
  }

  const handleShowINeedIt = () => {
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

      if (currentView === 'idontneedit') {
        return (
          <IDontNeedIt
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === 'sleeponit') {
        return (
          <SleepOnIt
            onBack={handleBackToProduct}
            onClose={handleBackToProduct}
          />
        )
      }

      if (currentView === 'ineedit') {
        return (
          <INeedIt 
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

