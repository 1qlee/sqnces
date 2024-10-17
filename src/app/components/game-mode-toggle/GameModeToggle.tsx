import * as ToggleGroup from '@radix-ui/react-toggle-group';
import styles from './GameModeToggle.module.css';
import useGameState from '~/app/hooks/useGameState';
import type { WordLength } from "../game/Game.types";

export default function GameModeToggle() {
  const [gameState, setGameState] = useGameState();
  const status6 = gameState.games[6].status;
  const status7 = gameState.games[7].status;
  const status8 = gameState.games[8].status; 
  const style6 = getTagStyle(status6);
  const style7 = getTagStyle(status7);
  const style8 = getTagStyle(status8);

  function getTagText(status: string | undefined) {
    switch (status) {
      case "lost":
        return "Lost";
      case "won":
        return "Won"
      case "playing":
        return "Playing"
      default:
        return "";
    }
  }

  function getTagStyle(status: string | undefined) {
    switch (status) {
      case "lost":
        return styles.isLost;
      case "won":
        return styles.isWon;
      case "playing":
        return styles.isPlaying;
      default:
        return "";
    }
  }

  return (
    <ToggleGroup.Root 
      type="single"
      value={String(gameState.wordLength)}
      onValueChange={(value) => {
        if (value) setGameState({
          ...gameState,
          wordLength: Number(value) as WordLength,
        });
      }}
      className={styles.toggleGroup}
    >
      <ToggleGroup.Item 
        value="6" 
        className={styles.toggleItem}
      >
        6 Letters
        <span
          className={[
            styles.tag,
            style6,
          ].join(' ')}
        >
          {getTagText(status6)}
        </span>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="7" className={styles.toggleItem}>
        7 Letters
        <span
          className={[
            styles.tag,
            style7,
          ].join(' ')}
        >
          {getTagText(status7)}
        </span>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="8" className={styles.toggleItem}>
        8 Letters
        <span
          className={[
            styles.tag,
            style8,
          ].join(' ')}
        >
          {getTagText(status8)}
        </span>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}