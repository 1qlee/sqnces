import * as ToggleGroup from "@radix-ui/react-toggle-group";
import styles from "./GameModeToggleGroup.module.css";
import useGameState from "~/app/hooks/useGameState";
import type { WordLength } from "../game/Game.types";

export default function GameModeToggleGroup() {
  const [gameState, setGameState] = useGameState();

  return (
    <ToggleGroup.Root
      type="single"
      orientation="horizontal"
      value={String(GameModeToggleGroup)}
      onValueChange={(value) => {
        setGameState({ 
          ...gameState, 
          settings: {
            hardMode: gameState.games[+value as WordLength].hardMode,
          },
          wordLength: +value });
      }}
      className={styles.group}
    >
      {Object.entries(gameState.games).map(([wordLength]) => (
        <ToggleGroup.Item
          key={wordLength}
          value={wordLength}
          className={styles.item}
        >
          {wordLength} Letters
        </ToggleGroup.Item>
      ))}
      <span 
        className={styles.selector}
        style={{
          transform: `translateX(calc(${(gameState.wordLength - 6) * 100}% + ${(gameState.wordLength - 6) * 8}px))`,
        }}
      >
        {gameState.wordLength} Letters
      </span>
    </ToggleGroup.Root>
  )
}