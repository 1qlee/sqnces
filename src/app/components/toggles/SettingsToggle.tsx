import { Gear } from "@phosphor-icons/react";
import Toggle from "../toggle/Toggle";
import type { Dispatch, SetStateAction } from "react";

type EndgameToggleProps = {
  className?: string;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsToggle({
  className,
  setShowSettingsModal,
}: EndgameToggleProps) {
  return (
    <Toggle
      className={className ? ` ${className}` : ""}
      onClick={() => setShowSettingsModal(prev => !prev)}
    >
      <Gear size={18} />
    </Toggle>
  )
}
