import * as Select from "@radix-ui/react-select";
import useGameState from "~/app/hooks/useGameState";
import {
  Check,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import selectStyles from "../select/Select.module.css";
import type { WordLength } from "../game/Game.types";
import { useGameDispatch } from "~/app/contexts/GameProvider";
import GuessTracker from "../guess-tracker/GuessTracker"

type SelectProps = {
  disabled?: boolean;
}

export default function GameModeSelect({
  disabled,
}: SelectProps) {
  const [gameState, setGameState] = useGameState();
  const wordLength = String(gameState.wordLength);
  const dispatch = useGameDispatch();
  const sixLetterGame = gameState.games[6];
  const sevenLetterGame = gameState.games[7];
  const eightLetterGame = gameState.games[8];

  function handleSelectChange(value: string) {
    const wordLength = +value as WordLength;

    dispatch({
      type: "editKey",
      toggled: false,
      key: 0,
    })
    
    setGameState({ 
      ...gameState, 
      wordLength: wordLength,
      settings: {
        hardMode: gameState.games[wordLength].hardMode,
      }
    })
  }

  return (
    <Select.Root
      value={wordLength}
      onValueChange={(value) => handleSelectChange(value)}
      disabled={disabled}
    >
      <Select.Trigger className={selectStyles.trigger} aria-label="Game Mode">
        <Select.Value style={{whiteSpace:"nowrap"}} placeholder="Game Mode">
          <div className={selectStyles.value}>
            <span>{wordLength} Letters</span>
          </div>
        </Select.Value>
        <Select.Icon className={selectStyles.icon}>
          <CaretDown weight="bold" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content 
          position="popper"
          align="center"
          sideOffset={4}
          className={selectStyles.content}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <Select.ScrollUpButton className={selectStyles.scrollUp}>
            <CaretUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="SelectViewport">
            <Select.Item 
              value="6"
              className={selectStyles.item}
            >
              <Select.ItemText>6 Letters</Select.ItemText>
              <Select.ItemIndicator className="SelectItemIndicator">
                <Check />
              </Select.ItemIndicator>
              <GuessTracker 
                game={sixLetterGame}
              />
            </Select.Item>
            <Select.Item value="7" className={selectStyles.item}>
              <GuessTracker
                game={sevenLetterGame}
              />
              <Select.ItemText>7 Letters</Select.ItemText>
              <Select.ItemIndicator className="SelectItemIndicator">
                <Check />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="8" className={selectStyles.item}>
              <GuessTracker
                game={eightLetterGame}
              />
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