"use client";

import { useState, useEffect } from "react";
import { getPuzzle } from "~/app/actions/getPuzzle";
import type { WordLength } from "./Game.types";
import useGameState from "~/app/hooks/useGameState";
import { GameProvider } from "~/app/contexts/GameProvider";
import { generateDateString } from "~/helpers/formatters/dates";

import Nav from "../nav/Nav";
import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";
import InfoModal from "../info-modal/InfoModal";
import MainMenu from "../main-menu/MainMenu";
import EndgameModal from "../endgame-modal/EndgameModal";
import SettingsModal from "../settings-modal/SettingsModal";

const todaysDate = generateDateString(new Date());

export default function Game() {
  const [loading, setLoading] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [disableGameModeSelect, setDisableGameModeSelect] = useState<boolean>(false);
  const [showEndgameModal, setShowEndgameModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false); 
  const [gameState, setGameState] = useGameState();
  const currentGame = gameState?.games && gameState.games[gameState.wordLength as WordLength];
  const wordData = gameState.puzzle.words.find(word => word.length === gameState.wordLength)!;

  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const puzzleData = await getPuzzle(todaysDate);
        setGameState({
          ...gameState,
          games: {
            6: {
              guesses: [],
              status: "notStarted",
              hardMode: gameState.games[6].hardMode,
              word: "",
            },
            7: {
              guesses: [],
              status: "notStarted",
              hardMode: gameState.games[7].hardMode,
              word: "",
            },
            8: {
              guesses: [],
              status: "notStarted",
              hardMode: gameState.games[8].hardMode,
              word: "",
            },
          },
          wordLength: 6,
          puzzle: {
            id: puzzleData.id,
            date: puzzleData.date,
            words: puzzleData.words,
          }
        })
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    // refresh stale localStorage puzzle data
    if (gameState.puzzle.date !== todaysDate) {
      void fetchPuzzle();
    }
    else {
      setLoading(false);
    }
  }, [loading])

  return (
    <>
      {showMainMenu ? (
        <MainMenu
          setShowMainMenu={setShowMainMenu}
          currentGame={currentGame}
          loading={loading}
        />
      ) : (
        <GameProvider>
          <Nav
            disableGameModeSelect={disableGameModeSelect}
            setShowEndgameModal={setShowEndgameModal}
            setShowSettingsModal={setShowSettingsModal}
          />
          <main
            className={styles.game}
          >
            <InfoModal />
            <Sequence
              currentGame={currentGame}
              wordData={wordData}
            />
            <GuessArea
              currentGame={currentGame}
              wordData={wordData}
              setDisableGameModeSelect={setDisableGameModeSelect}
              setShowEndgameModal={setShowEndgameModal}
            />
            {showEndgameModal && (
              <EndgameModal
                currentGame={currentGame}
                showEndgameModal={showEndgameModal}
                setShowEndgameModal={setShowEndgameModal}
              />
            )}
            {showSettingsModal && (
              <SettingsModal
                currentGame={currentGame}
                showSettingsModal={showSettingsModal}
                setShowSettingsModal={setShowSettingsModal}
              />
            )}
          </main>
        </GameProvider>
      )}
    </>
  )
}