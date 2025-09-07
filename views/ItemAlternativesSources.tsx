import WithAPIResponse from "~components/ui/WithAPIResponse"
import Skeleton from "../components/ui/Skeleton"
import RefurbishedIcon from "../components/ui/RefurbishedIcon"
import RentBorrowIcon from "../components/ui/RentBorrowIcon"
import DIYIcon from "../components/ui/DIYIcon"
import { type Item } from "./ProductView"
import { type AlternativeType } from "./ProductAlternatives"
import { spacing, textSize } from "../design-system"
import { useFetch } from "~hooks/useFetch"
import { useEffect } from "react"

import * as z from "zod"

const zAlternative = z.object({
  title: z.string(),
  source_logo: z.string().nullable().optional(),
  source: z.string().nullable().optional().default("Unknown"),
  description: z.string(),
  estimate_savings: z.coerce.string().optional().default("0"),
  url: z.string(),
})

const zDataResponse = z.object({
  alternatives: z.array(zAlternative)
})

export type Alternative = z.infer<typeof zAlternative>
export type DataResponse = z.infer<typeof zDataResponse>

type AlternativeItemProps = {
  product: Alternative
  titleLength?: number
  descriptionLength?: number
  alternativeTypeName?: string
}

const AlternativeItem = ({ product, titleLength = 10, descriptionLength = 10, alternativeTypeName }: AlternativeItemProps) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const getSourceInitial = (source: string) => {
    let _source = source || "Unknown"
    return _source.charAt(0).toUpperCase()
  }

  const getAlternativeIcon = (typeName?: string) => {
    if (!typeName) {
      return <div style={fallbackImageStyle}>{getSourceInitial(product.source)}</div>
    }

    const lowerTypeName = typeName.toLowerCase()
    
    if (lowerTypeName.includes('refurbished') || lowerTypeName.includes('used') || lowerTypeName.includes('second-hand')) {
      return <RefurbishedIcon size={60} />
    } else if (lowerTypeName.includes('rent') || lowerTypeName.includes('borrow') || lowerTypeName.includes('lease')) {
      return <RentBorrowIcon size={60} />
    } else if (lowerTypeName.includes('diy') || lowerTypeName.includes('make') || lowerTypeName.includes('build')) {
      return <DIYIcon size={60} />
    } else {
      return <div style={fallbackImageStyle}>{getSourceInitial(product.source)}</div>
    }
  }

  const productItemStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: spacing.md,
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
  }

  const productImageStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "8px",
    objectFit: "cover",
  }

  const fallbackImageStyle: React.CSSProperties = {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    backgroundColor: "#68c3d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: textSize.lg,
    fontWeight: "bold",
  }

  const productInfoStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  }

  const productNameStyle: React.CSSProperties = {
    fontSize: textSize.sm,
    fontWeight: "bold",
    color: "#2660a4",
    textDecoration: "underline",
    margin: 0,
  }

  const productDescriptionStyle: React.CSSProperties = {
    fontSize: textSize.xs,
    color: "var(--text-color-dark)",
    margin: 0,
    opacity: 0,
    transition: "opacity 0.2s ease",
    position: "absolute",
    top: "100%",
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "white",
    padding: spacing.sm,
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 10,
    pointerEvents: "none",
  }

  const discountBadgeStyle: React.CSSProperties = {
    backgroundColor: "#E74C3C",
    color: "white",
    fontSize: textSize.xs,
    fontWeight: "bold",
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: "4px",
    marginLeft: "auto",
  }

  const truncatedTitle = truncateText(product.title, titleLength)
  const truncatedDescription = truncateText(product.description, descriptionLength)
  const showTitleTooltip = product.title.length > titleLength
  const showDescriptionTooltip = product.description.length > descriptionLength

  return (
    <div
      style={productItemStyle}
      className="hover-highlight"
      onClick={() => {
        console.log(`Selected: ${product.title}`)
        window.open(product.url, '_blank')
      }}
      onMouseEnter={(e) => {
        const descriptionElement = e.currentTarget.querySelector('[data-description]') as HTMLElement
        if (descriptionElement) {
          descriptionElement.style.opacity = "1"
          descriptionElement.style.pointerEvents = "auto"
        }
      }}
      onMouseLeave={(e) => {
        const descriptionElement = e.currentTarget.querySelector('[data-description]') as HTMLElement
        if (descriptionElement) {
          descriptionElement.style.opacity = "0"
          descriptionElement.style.pointerEvents = "none"
        }
      }}
    >
      {product.source_logo ? (
        <img 
          src={product.source_logo} 
          alt={product.title} 
          style={productImageStyle} 
        />
      ) : (
        getAlternativeIcon(alternativeTypeName)
      )}
      <div style={productInfoStyle}>
        <p 
          style={productNameStyle}
          title={showTitleTooltip ? product.title : undefined}
        >
          {truncatedTitle}
        </p>
        <p 
          style={productDescriptionStyle}
          title={showDescriptionTooltip ? product.description : undefined}
          data-description
        >
          {truncatedDescription}
        </p>
      </div>
      {product.estimate_savings && (
        <div style={discountBadgeStyle}>{product.estimate_savings}</div>
      )}
    </div>
  )
}

type ItemAlternativesSourcesProps = {
  item: Item
  selectedAlternative: AlternativeType
  titleLength?: number
  descriptionLength?: number
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.lg,
  maxHeight: "400px",
  overflowY: "auto",
  paddingRight: spacing.sm,
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: "var(--secondary-background-color)",
  borderRadius: "12px",
  padding: spacing.lg,
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  fontWeight: "bold",
  color: "var(--text-color-dark)",
  margin: 0,
}

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: textSize.sm,
  color: "var(--text-color-dark)",
  opacity: "0.8",
  margin: 0,
}

const productListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
}

const ItemAlternativesSources = ({ item, selectedAlternative, titleLength, descriptionLength }: ItemAlternativesSourcesProps) => {
  const { fetchData, loading, success, data, errorMessage } = useFetch<DataResponse>()

  useEffect(() => {
          fetchData(`/items/${item.id}/alternatives/${selectedAlternative.id}`, {
        method: "GET",
        dataValidation: zDataResponse
      }).catch((error) => {
        console.error("--- ERROR --> ", error)
      })
  }, [item.id, selectedAlternative.id])

  const alternatives = data?.alternatives || []

  return (
    <div style={containerStyle}>
      <WithAPIResponse
        loading={loading}
        errorMessage={errorMessage}
        success={success}
        onLoadingComponent={<Skeleton count={3} />}
      >
        {alternatives.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>{selectedAlternative.name}</h3>
            <p style={sectionSubtitleStyle}>{selectedAlternative.description}</p>
            <div style={productListStyle}>
              {alternatives.map((product) => (
                <AlternativeItem
                  key={product.title}
                  product={product}
                  titleLength={titleLength}
                  descriptionLength={descriptionLength}
                  alternativeTypeName={selectedAlternative.name}
                />
              ))}
            </div>
          </div>
        )}
      </WithAPIResponse>
    </div>
  )
}

export default ItemAlternativesSources
