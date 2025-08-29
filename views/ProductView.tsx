import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Header from "../components/ui/Header"
import Nudge from "../components/Nudge"

import thoughtfulIcon from "url:../assets/icons/Icons/Thoughtful.svg"
import lightbulbIcon from "url:../assets/icons/Icons/Lightbulb.svg"
import clockIcon from "url:../assets/icons/Icons/Clock.svg"
import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"
import { useFetch } from "~hooks/useFetch"
import { useEffect, useState } from "react"
import WithAPIResponse from "~components/ui/WithAPIResponse"
import * as z from "zod"
import { spacing, commonSpacing, textSize } from "../design-system"

const zItem = z.object({
  category: z.string(),
  currency: z.string(),
  description: z.string(),
  id: z.coerce.string(),
  marketplace: z.string(),
  marketplace_id: z.string(),
  name: z.string(),
  price: z.coerce.string(),
  tags: z.array(z.string()),
})

export type Item = z.infer<typeof zItem>

const zDataResponse = z.object({
  item: zItem
})

export type DataResponse = z.infer<typeof zDataResponse>

type ProductViewProps = {
  url: string
  productId?: string | null
  marketplace: "amazon"
  onShowAlternatives: (item: Item) => void
  onShowIDontNeedIt: () => void
  onShowSleepOnIt: (item: Item) => void
  onShowINeedIt: (item: Item) => void
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  marginBottom: commonSpacing.sectionMargin,
  textAlign: "center",
  position: "relative",
}

const titleStyle: React.CSSProperties = {
  fontSize: textSize.xl,
  fontWeight: "bold",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: textSize.md,
  color: "var(--text-color-light)",
  opacity: "0.8",
  margin: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
}

const bodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.xl,
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
}

const actionsGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: spacing.md,
}

const ProductView = ({ url, productId, marketplace, onShowAlternatives, onShowIDontNeedIt, onShowSleepOnIt, onShowINeedIt }: ProductViewProps) => {
  const { fetchData, loading, success, data, errorMessage } = useFetch<DataResponse>()

  useEffect(() => {
    fetchData("/items/", {
      method: "POST",
      body: {
        url,
        dataValidation: zDataResponse
      }
    }).catch((error) => {
      console.error("--- ERROR --> ", error)
    })
  }, [])

  return (
    <Card>
      <Header onClose={() => {}} centerIcon={<h2 style={titleStyle}>ThinkTwice</h2>} />
      <div style={headerStyle}>
        <p style={subtitleStyle}>
          <img src={lightbulbIcon} alt="lightbulb" style={{ width: '16px', height: '16px' }} />
          Quick thought before you buy
        </p>
      </div>
      <div style={bodyStyle}>
        <Nudge />
        <div style={actionsStyle}>
          <Button variant="primary" icon={thoughtfulIcon} onClick={onShowIDontNeedIt}>I don't really need it</Button>
          <WithAPIResponse
            loading={loading}
            errorMessage={errorMessage}
            success={success}
            onLoadingComponent={<Button variant="disabled" icon={lightbulbIcon} onClick={() => {}}>Searching for alternatives...</Button>}
          >
            <Button
              variant="secondary"
              icon={lightbulbIcon}
              onClick={() => {
                if (data?.item) {
                  onShowAlternatives(data.item)
                }
              }}
            >Sustainable alternatives</Button>
          </WithAPIResponse>
          <div style={actionsGroupStyle}>
            <Button variant="tertiary" icon={clockIcon} onClick={() => {
              if (data?.item) {
                onShowSleepOnIt(data.item)
              }
            }}>Sleep on it</Button>
            <Button variant="tertiary" icon={trophyIcon} onClick={() => {
              if (data?.item) {
                onShowINeedIt(data.item)
              }
            }}>I need it</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProductView

