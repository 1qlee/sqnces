import * as Select from "@radix-ui/react-select";
import useGameState from "~/app/hooks/useGameState";
import {
  Check,
  CaretDown,
  CaretUp,
  Circle,
} from "@phosphor-icons/react";
import styles from "./GameModeSelect.module.css";

type SelectProps = {
  disabled: boolean;
}

export default function GameModeSelect({
  disabled,
}: SelectProps) {
  const [gameState, setGameState] = useGameState();
  const wordLength = String(gameState.wordLength);

  function handleSelectChange(value: string) {
    const wordLength = +value;
    
    setGameState({ 
      ...gameState, 
      wordLength: wordLength,
    })
  }

  function handleIconStatus(status: string | undefined) {
    switch(status) {
      case "notStarted":
        return "var(--foreground)"
      case "playing":
        return "var(--misplaced)"
      case "won":
        return "var(--correct)"
      case "lost":
        return "var(--incorrect)"
      default:
        return "var(--foreground)"
    }
  }

  return (
    <Select.Root
      value={wordLength}
      onValueChange={(value) => handleSelectChange(value)}
      disabled={disabled}
    >
      <Select.Trigger className={styles.trigger} aria-label="Game Mode">
        <Select.Value style={{whiteSpace:"nowrap"}} placeholder="Game Mode">
          {wordLength} Letters
        </Select.Value>
        <Select.Icon className={styles.icon}>
          <CaretDown weight="bold" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content 
          position="popper"
          align="center"
          sideOffset={2}
          className={styles.content}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <Select.ScrollUpButton className={styles.scrollUp}>
            <CaretUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="SelectViewport">
            <Select.Item value="6" className={styles.item}>
              <span className={styles.tag}>
                <Circle size={10} weight="fill" color={handleIconStatus(gameState.games[6].status)} />
              </span>
              <Select.ItemText>6 Letters</Select.ItemText>
              <Select.ItemIndicator className="SelectItemIndicator">
                <Check />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="7" className={styles.item}>
              <span className={styles.tag}>
                <Circle size={10} weight="fill" color={handleIconStatus(gameState.games[7].status)} />
              </span>
              <Select.ItemText>7 Letters</Select.ItemText>
              <Select.ItemIndicator className="SelectItemIndicator">
                <Check />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="8" className={styles.item}>
              <span className={styles.tag}>
                <Circle size={10} weight="fill" color={handleIconStatus(gameState.games[8].status)} />
              </span>
              <Select.ItemText>8 Letters</Select.ItemText>
              <Select.ItemIndicator className="SelectItemIndicator">
                <Check />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}