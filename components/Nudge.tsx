import WithAPIResponse from "~components/ui/WithAPIResponse"
import { useFetch } from "~hooks/useFetch"
import { useEffect } from "react"
import * as z from "zod"
import { spacing, commonSpacing, textSize } from "../design-system"

const zNudge = z.object({
    nudge: z.object({
        nudge: z.string(),
        theme: z.string(),
        type: z.string()
    })
})

type Nudge = z.infer<typeof zNudge>



const Nudge = () => {


  const { fetchData, loading, success, data, errorMessage } = useFetch<Nudge>()

    useEffect(() => {
        fetchData("/nudges/random", { dataValidation: zNudge })
    }, [])

  return (
    <WithAPIResponse loading={loading} errorMessage={errorMessage} success={success}>
        <div className="info-container" style={{ textAlign: "center", marginBottom: spacing.sm }}>
        <p className="info-container-text" style={{ fontWeight: "500" }}>{data?.nudge.nudge}</p>
        </div>
    </WithAPIResponse>
  )
}

export default Nudge
