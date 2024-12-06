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
        const date = new Date().toLocaleDateString();
        const puzzleData = await getPuzzle(date);
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

    // temporary fix for puzzle change - remove after 12/6/24
    if (!gameState.puzzle.words.find(word => word.sequence.string === "VAR")) {
      void fetchPuzzle();
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
        <>
          <Nav
            disableGameModeSelect={disableGameModeSelect}
            setShowEndgameModal={setShowEndgameModal}
            setShowSettingsModal={setShowSettingsModal}
          />
          <GameProvider>
            <main
              className={styles.game}
            >
              <InfoModal />
              <Sequence
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
                  showSettingsModal={showSettingsModal}
                  setShowSettingsModal={setShowSettingsModal}
                />
              )}
            </main>
          </GameProvider>
        </>
      )}
    </>
  )
}