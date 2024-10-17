"use client";

import { useState, useEffect } from "react";
import type { ClientPuzzle } from "~/server/types/word";

import Nav from "../nav/Nav";
import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";
import InfoModal from "../info-modal/InfoModal";
import MainMenu from "../main-menu/MainMenu";
import EndgameModal from "../endgame-modal/EndgameModal";
import useGameState from "~/app/hooks/useGameState";

export default function Game({
  puzzleData
}: { puzzleData: ClientPuzzle }) {
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [showEndgameModal, setShowEndgameModal] = useState<boolean>(false);
  const [gameState, setGameState] = useGameState();
  const currentGame = gameState.games[gameState.wordLength];
  const wordData = puzzleData.words.find(word => word.length === gameState.wordLength)!;

  function resetGameState() {
    setGameState({
      ...gameState,
      loading: false,
      puzzle: puzzleData.id,
      games: {
        6: {
          guesses: [],
          status: "notStarted",
        },
        7: {
          guesses: [],
          status: "notStarted",
        },
        8: {
          guesses: [],
          status: "notStarted",
        },
      },
      wordLength: 6,
    });
  }

  useEffect(() => {
    if (!gameState.puzzle) {
      resetGameState();
    }
    
    if (gameState.puzzle !== puzzleData.id) {
      resetGameState();
    }
  }, [])

  return (
    <>
      <Nav 
        setShowEndgameModal={setShowEndgameModal}
      />
      <main
        className={styles.game}
      >
        {showMainMenu ? (
          <MainMenu
            setShowMainMenu={setShowMainMenu}
            puzzleData={puzzleData}
            currentGame={currentGame}
          />
        ) : (
          <>
            <InfoModal />
            <Sequence
              wordData={wordData}
            />
            <GuessArea
              currentGame={currentGame}
              wordData={wordData}
              setShowEndgameModal={setShowEndgameModal}
            />
            {showEndgameModal && (
              <EndgameModal
                currentGame={currentGame}
                puzzleData={puzzleData}
                showEndgameModal={showEndgameModal}
                setShowEndgameModal={setShowEndgameModal}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}