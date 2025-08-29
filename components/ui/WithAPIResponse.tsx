import Loading from './Loading'
import Error from './Error'


type WithAPIResponseProps = {
  loading: boolean
  errorMessage: string | null
  success: boolean
  children: React.ReactNode
  loadingMessage?: string
  onLoadingComponent?: React.ReactNode
}

const WithAPIResponse = ({ children, loading, errorMessage, success, loadingMessage, onLoadingComponent }: WithAPIResponseProps) => {
  if (loading) {
    if (onLoadingComponent) {
      return onLoadingComponent
    }
    return <Loading message={loadingMessage} />
  }

  if (!success) {
    return <Error message={errorMessage} />
  }

  return children
}

export default WithAPIResponse
