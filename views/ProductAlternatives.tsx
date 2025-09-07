import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"
import WithAPIResponse from "~components/ui/WithAPIResponse"
import Skeleton from "../components/ui/Skeleton"
import ItemAlternativesSources from "./ItemAlternativesSources"

import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"
import { type Item } from "./ProductView"
import { spacing, commonSpacing, textSize } from "../design-system"
import { useFetch } from "~hooks/useFetch"
import { useEffect } from "react"
import * as z from "zod"

const zAlternativeType = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  search: z.string(),
  do_not_search: z.string(),
})

const zDataResponse = z.object({
  alternative_types: z.array(zAlternativeType)
})

export type AlternativeType = z.infer<typeof zAlternativeType>
export type DataResponse = z.infer<typeof zDataResponse>

type ProductAlternativesProps = {
  item: Item
  onBack: () => void
  onClose?: () => void
  onSelectAlternative: (alternativeId: number) => void
  expandedAlternativeId: number | null
}



const titleStyle: React.CSSProperties = {
  fontSize: textSize.lg,
  fontWeight: "bold",
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${spacing.sm} 0`,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.sm,
  color: "var(--text-color-light)",
  textAlign: "center",
  margin: `0 0 ${commonSpacing.sectionMargin} 0`,
  opacity: "0.9",
}

const optionsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  width: "100%",
}

const investButtonStyle: React.CSSProperties = {
  marginTop: spacing.lg,
}

const ProductAlternatives = ({ item, onBack, onClose, onSelectAlternative, expandedAlternativeId }: ProductAlternativesProps) => {
  const { fetchData, loading, success, data, errorMessage } = useFetch<DataResponse>()

  useEffect(() => {
    fetchData(`/items/${item.id}/alternative-types`, {
      method: "GET",
      dataValidation: zDataResponse
    }).catch((error) => {
      console.error("--- ERROR --> ", error)
    })
  }, [item.id])

  const alternatives = data?.alternative_types || []
  
  // Define variants for alternative buttons
  const buttonVariants = ["primary", "secondary", "tertiary"]

  const getButtonContent = (name: string, description: string) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs }}>
        <div style={{ fontWeight: "bold", fontSize: textSize.sm }}>
          {name}
    </div>
    <div style={{ fontSize: textSize.xs, opacity: "0.8" }}>
          {description}
        </div>
      </div>
    )
  }

  const genSentence = (alternatives: AlternativeType[], loading: boolean) => {
    if (loading) {
        return ""
    }

    if (alternatives.length > 1) {
        return "These options are better for the planet and your wallet."
    } else {
        return "This option is better for the planet and your wallet."
    }
  }

  const expandedAlternative = alternatives.find(alt => alt.id === expandedAlternativeId)

  return (
    <Card>
      <Header
        onBack={onBack}
        onClose={onClose}
        centerIcon={<img src={thoughtfulIcon} alt="sustainability" style={{ width: "35px", height: "35px" }} />}
        centerIconAlt="sustainability"
      />
      <br />
      <h1 style={titleStyle}>Congrats on making a thoughtful choice!</h1>
      <p style={subtitleStyle}>{genSentence(alternatives, loading)}</p>

      <div style={optionsContainerStyle}>
        <WithAPIResponse
          loading={loading}
          errorMessage={errorMessage}
          success={success}
          onLoadingComponent={<Skeleton count={2} />}
        >
          {alternatives.map((alternative, index) => (
            <div key={alternative.id}>
              <div style={{ marginBottom: spacing.sm }}>
                <Button
                  variant={buttonVariants[index % buttonVariants.length]}
                  icon={null}
                  onClick={() => {
                    onSelectAlternative(alternative.id)
                  }}
                >
                  {getButtonContent(alternative.name, alternative.description)}
                </Button>
              </div>
              
              {expandedAlternativeId === alternative.id && expandedAlternative && (
                <div style={{ marginBottom: spacing.lg }}>
                  <ItemAlternativesSources 
                    item={item}
                    selectedAlternative={expandedAlternative}
                  />
                </div>
              )}
            </div>
          ))}
        </WithAPIResponse>
        
        <div style={investButtonStyle}>
          <Button
            variant="tertiary"
            icon={null}
            onClick={() => {
              console.log("Invest Instead clicked")
            }}
          >
            {getButtonContent("Invest Instead", "Grow your savings")}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ProductAlternatives
