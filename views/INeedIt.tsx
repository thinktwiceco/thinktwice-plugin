import trophyIcon from "url:../assets/icons/Icons/Trophy.svg"

import Celebration from "./Celebration"

type INeedItProps = {
  onBack: () => void
  onClose?: () => void
}

const INeedIt = ({ onBack, onClose }: INeedItProps) => {
  return (
    <Celebration
      icon={trophyIcon}
      iconAlt="trophy"
      title="Trusting yourself is powerful."
      subtitle="Enjoy your new purchase."
      autoCloseDelay={4000}
      onBack={onBack}
      onClose={onClose}
    />
  )
}

export default INeedIt
