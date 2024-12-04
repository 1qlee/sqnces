import type { Dispatch, SetStateAction } from 'react';
import type { Game } from '../game/Game.types';
import { Info } from '@phosphor-icons/react';
import popoverStyles from '../popover/Popover.module.css';

import Button from '../button/Button';
import useGameState from '~/app/hooks/useGameState';
import styles from './MainMenu.module.css';
import HardModeToggle from '../toggles/HardModeToggle';
import * as Popover from "@radix-ui/react-popover";
import GameModeSelect from '../game-mode-select/GameModeSelect';
import ColorModeToggle from '../toggles/ColorModeToggle';

type MainMenuProps = {
  setShowMainMenu: Dispatch<SetStateAction<boolean>>;
  currentGame: Game;
  loading: boolean;
};

const sqncesLogo = [
  "S",
  "Q",
  "N",
  "C",
  "E",
  "S",
]

export default function MainMenu({
  setShowMainMenu,
  currentGame,
  loading,
}: MainMenuProps) {
  const [gameState, setGameState] = useGameState();
  const { puzzle } = gameState;
  const { status } = currentGame;

  function handleButtonClick() {
    switch(status) {
      case "notStarted":
        setGameState({
          ...gameState,
          games: {
            ...gameState.games,
            [gameState.wordLength]: {
              ...currentGame,
              status: "playing",
              hardMode: gameState.settings.hardMode,
              word: "",
            },
          },
          puzzle: {
            id: puzzle.id,
            date: puzzle.date,
            words: puzzle.words,
          }
        });
        setShowMainMenu(false);
        break;
      case "playing":
        setShowMainMenu(false);
        break;
      case "lost":
      case "won":
        setShowMainMenu(false);
        break;
      default:
        break;
    }
  }

  function handleButtonText() {
    switch(status) {
      case "notStarted":
        return "Start Game";
      case "playing":
        return "Resume Game";
      case "won":
      case "lost":
        return "Review Game";
      default:
        return "Loading...";
    }
  }

  function resetGameState() {
    setGameState({
      ...gameState,
      games: {
        6: {
          guesses: [],
          status: "notStarted",
          hardMode: true,
          word: "",
        },
        7: {
          guesses: [],
          status: "notStarted",
          hardMode: true,
          word: "",
        },
        8: {
          guesses: [],
          status: "notStarted",
          hardMode: true,
          word: "",
        },
      },
      wordLength: 6,
    })
  }

  return (
    <div className={styles.menu}>
      <div className={styles.word}>
        {sqncesLogo.map((letter, index) => (
          <span
            key={index}
            className={styles.letter}
          >
            {letter}
          </span>
        ))}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.content}>
          {status === "won" && (
            <>
              <h1 className={styles.heading}>You won!</h1>
              <p className={styles.body}>Come back tomorrow for a brand new puzzle.</p>
            </>
          )}
          {status === "lost" && (
            <>
              <h1 className={styles.heading}>You lost...</h1>
              <p className={styles.body}>Come back tomorrow for a brand new puzzle.</p>
            </>
          )}
          {status === "notStarted" && (
            <>
              <p className={styles.body}>Use a 3-letter sequence to find the hidden word in 6 tries.</p>
            </>
          )}
          {status === "playing" && (
            <>
              <div className={styles.heading}>
                Continue Game
              </div>
              <p className={styles.body}>
                {currentGame.guesses.length === 0 ? (
                  "It's time to make your first guess!"
                ) : (
                  `You've made ${currentGame.guesses.length} guess${currentGame.guesses.length > 1 ? "es" : ""} so far.`
                )}
              </p>
            </>
          )}
          <Button
            className={styles.button}
            onClick={() => handleButtonClick()}
          >
            {handleButtonText()}
          </Button>
          <div
            className={styles.settings}
          >
            
            {!gameState.showHelp && (
              <>
                <div className={styles.settingsItem}>
                  <p className={styles.subtext}>
                    <span>Hard Mode</span>
                    <Popover.Root>
                      <Popover.Trigger
                        asChild
                      >
                        <button className={popoverStyles.button}>
                          <Info size={16} weight="bold" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="top"
                          sideOffset={4}
                          className={popoverStyles.content}
                        >
                          <p>If ON, out of bounds letters won't show additional clues like misplaced and incorrect letters.</p>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </p>
                  <HardModeToggle />
                </div>
                <div className={styles.settingsItem}>
                  <p className={styles.subtext}>Game Mode</p>
                  <GameModeSelect />
                </div>
              </>
            )}
            <div className={styles.settingsItem}>
              <p className={styles.subtext}>Theme</p>
              <ColorModeToggle />
            </div>
          </div>
          <p
            className={styles.time}
          >
            {puzzle.date}
          </p>
          <p>Puzzle #{puzzle.id}</p>
        </div>
      )}
    </div>
  )
}