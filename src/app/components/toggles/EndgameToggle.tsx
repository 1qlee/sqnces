import { ChartBar } from "@phosphor-icons/react";
import Toggle from "../toggle/Toggle";
import type { Dispatch, SetStateAction } from "react";

type EndgameToggleProps = {
  className?: string;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
}

export default function EndgameToggle({ 
  className,
  setShowEndgameModal,
 }: EndgameToggleProps) {
  return (
    <Toggle
      className={className ? ` ${className}` : ""}
      onClick={() => setShowEndgameModal(prev => !prev)}
    >
      <ChartBar size={18} />
    </Toggle>
  )
}
