import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"
import WithAPIResponse from "~components/ui/WithAPIResponse"
import Skeleton from "../components/ui/Skeleton"
import { type Item } from "./ProductView"
import { type AlternativeType } from "./ProductAlternatives"
import { spacing, commonSpacing, textSize } from "../design-system"
import { useFetch } from "~hooks/useFetch"
import { useEffect } from "react"
import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"

import * as z from "zod"

const zAlternative = z.object({
  title: z.string(),
  source_logo: z.string().nullable().optional(),
  source: z.string().nullable().optional().default("Unknown"),
  description: z.string(),
  estimate_savings: z.string().optional(),
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
}

const AlternativeItem = ({ product, titleLength = 10, descriptionLength = 10 }: AlternativeItemProps) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const getSourceInitial = (source: string) => {
    return source.charAt(0).toUpperCase()
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

  const productPriceStyle: React.CSSProperties = {
    fontSize: textSize.xs,
    color: "var(--text-color-dark)",
    margin: 0,
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
    >
      {product.source_logo ? (
        <img 
          src={product.source_logo} 
          alt={product.title} 
          style={productImageStyle} 
          // onError={(e) => {
          //   e.currentTarget.src = thoughtfulIcon
          // }}
        />
      ) : (
        <div style={fallbackImageStyle}>
          {getSourceInitial(product.source)}
        </div>
      )}
      <div style={productInfoStyle}>
        <p 
          style={productNameStyle}
          title={showTitleTooltip ? product.title : undefined}
        >
          {truncatedTitle}
        </p>
        <p 
          style={productPriceStyle}
          title={showDescriptionTooltip ? product.description : undefined}
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
  onBack: () => void
  onClose?: () => void
  titleLength?: number
  descriptionLength?: number
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.sm} 0`,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${commonSpacing.sectionMargin} 0`,
  opacity: "0.9",
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

const alternativeButtonStyle: React.CSSProperties = {
  backgroundColor: "#FFE8D1",
  borderRadius: "12px",
  padding: spacing.lg,
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
}

const scrollbarStyle: React.CSSProperties = {
  scrollbarWidth: "thin",
  scrollbarColor: "#68c3d4 transparent",
}

const ItemAlternativesSources = ({ item, selectedAlternative, onBack, onClose, titleLength, descriptionLength }: ItemAlternativesSourcesProps) => {
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
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={<img src={thoughtfulIcon} alt="sustainability" style={{ width: "35px", height: "35px" }} />}
      />
      <br />
      <h1 style={titleStyle}>Congrats on making a thoughtful choice!</h1>
      <p style={subtitleStyle}>These options are better for the planet and your wallet.</p>
      
      <div style={{ ...containerStyle, ...scrollbarStyle }}>
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
                  />
                ))}
              </div>
            </div>
          )}
        </WithAPIResponse>

        {/* Rent or Borrow Section */}
        <div style={alternativeButtonStyle} className="hover-highlight">
          <h3 style={sectionTitleStyle}>Rent or Borrow</h3>
          <p style={sectionSubtitleStyle}>Use it when you need it</p>
        </div>
      </div>
    </Card>
  )
}

export default ItemAlternativesSources
