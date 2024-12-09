import useGameState from "~/app/hooks/useGameState";
import { Info } from "@phosphor-icons/react";
import Toggle from "../toggle/Toggle";

export default function HowToPlayToggle({ className }: { className?: string }) {
  const [gameState, setGameState] = useGameState();

  return (
    <Toggle
      className={className ? ` ${className}` : ""}
      onClick={() => setGameState({
        ...gameState,
        showHelp: !gameState.showHelp
      })}
    >
      <Info size={18} />
    </Toggle>
  )
}
