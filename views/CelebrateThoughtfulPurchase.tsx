import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"

import Celebration from "./Celebration"

type CelebrateThoughtfulPurchaseProps = {
  onClose?: () => void
}

const CelebrateThoughtfulPurchase = ({
  onClose
}: CelebrateThoughtfulPurchaseProps) => {
  return (
    <Celebration
      icon={trophyIcon}
      iconAlt="trophy"
      title="Well done! You made a thoughtful choice! 🎉"
      subtitle="You took the time to think it through."
      autoCloseDelay={2000}
      onClose={onClose}
    />
  )
}

export default CelebrateThoughtfulPurchase
