"use client"
import type { ClientPuzzle } from '~/server/types/word';
import type { Dispatch, SetStateAction } from 'react';
import type { Game } from '../game/Game.types';
import { Info } from '@phosphor-icons/react';
import popoverStyles from '../popover/Popover.module.css';

import Button from '../button/Button';
import useGameState from '~/app/hooks/useGameState';
import GameModeToggle from '../game-mode-toggle/GameModeToggle';
import styles from './MainMenu.module.css';
import HardModeToggle from '../toggles/HardModeToggle';
import * as Popover from "@radix-ui/react-popover";

type MainMenuProps = {
  setShowMainMenu: Dispatch<SetStateAction<boolean>>;
  puzzleData: ClientPuzzle;
  currentGame: Game;
};

export default function MainMenu({
  setShowMainMenu,
  puzzleData,
  currentGame,
}: MainMenuProps) {
  const [gameState, setGameState] = useGameState();
  const { status } = currentGame;
  
  if (!status) {
    return <div className={styles.menu}>Loading...</div>
  }

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
            },
          },
          puzzle: puzzleData.id,
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

  return (
    <div className={styles.menu}>
      <div className={styles.word}>
        {"SQNCES".split("").map((char, i) => (
          <span
            key={i}
            className={styles.letter}
          >
            {char}
          </span>
        ))}
      </div>
      {status === "won" && (
        <>
          <h1 className={styles.heading}>You won!</h1>
          <p className={styles.body}>Come back tomorrow for a brand new puzzle. Or, finish the rest of today's puzzles if you haven't already.</p>
        </>
      )}
      {status === "lost" && (
        <>
          <h1 className={styles.heading}>You lost...</h1>
          <p className={styles.body}>Come back tomorrow for a brand new puzzle. Or, finish the rest of today's puzzles if you haven't already.</p>
        </>
      )}
      {status === "notStarted" && (
        <>
          <div className={styles.heading}>
            New Game
          </div>
          <p className={styles.body}>Use a 3-letter sequence to find the hidden word.</p>
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
      <p className={styles.subtext}>Game mode:</p>
      <GameModeToggle />
      <div className={styles.marginBottom}>
        <p className={styles.subtext}>
          <span>Hard mode</span> 
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
                className={popoverStyles.content}
              >
                Some stuff
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        <span>:</span>
        </p>
        <HardModeToggle />
      </div>
      <Button
        className={styles.marginBottom}
        onClick={() => handleButtonClick()}
      >
        {handleButtonText()}
      </Button>
      <p
        className={styles.time}
      >
        {new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <p className={styles.badge}>Puzzle #{puzzleData.id}</p>
    </div>
  )
}