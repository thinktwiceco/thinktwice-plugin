import { useEffect } from "react"

/**
 * Injects Google Fonts link for Inter font family into the document head.
 * Only injects once per page load.
 */
export function useGoogleFonts() {
  useEffect(() => {
    const linkId = "plasmo-inter-font"
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link")
      link.id = linkId
      link.rel = "stylesheet"
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      document.head.appendChild(link)
    }
  }, [])
}
