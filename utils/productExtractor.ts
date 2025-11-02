import type { Product } from '../storage'

function extractAmazonProduct(productId: string): Product {
  const timestamp = Date.now()
  const url = window.location.href
  
  // Extract product name
  let name = 'Unknown Product'
  const titleElement = document.querySelector('#productTitle') || 
                       document.querySelector('#title') ||
                       document.querySelector('h1.product-title')
  if (titleElement) {
    name = titleElement.textContent?.trim() || 'Unknown Product'
  }
  
  // Extract price
  let price: string | null = null
  const priceSelectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole',
    '#price_inside_buybox'
  ]
  
  for (const selector of priceSelectors) {
    const priceElement = document.querySelector(selector)
    if (priceElement) {
      price = priceElement.textContent?.trim() || null
      if (price) break
    }
  }
  
  // Extract image URL
  let image: string | null = null
  const imageElement = document.querySelector('#landingImage') as HTMLImageElement ||
                      document.querySelector('#imgBlkFront') as HTMLImageElement ||
                      document.querySelector('.a-dynamic-image') as HTMLImageElement
  if (imageElement) {
    image = imageElement.src || imageElement.dataset.src || null
  }
  
  return {
    id: productId,
    name,
    price,
    image,
    url,
    timestamp,
    marketplace: 'amazon'
  }
}

export function extractProduct(marketplace: string, productId: string): Product {
  switch (marketplace) {
    case 'amazon':
      return extractAmazonProduct(productId)
    default:
      throw new Error(`Unsupported marketplace: ${marketplace}`)
  }
}

