"use client";

import { useState, useEffect } from "react";
import { getPuzzle } from "~/app/actions/getPuzzle";
import { openDB } from "idb";
import type { ClientPuzzle } from "~/server/types/word";
import type { WordLength } from "./Game.types";
import useUserStats from "~/app/hooks/useUserStats";
import useGameState from "~/app/hooks/useGameState";

import Nav from "../nav/Nav";
import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";
import InfoModal from "../info-modal/InfoModal";
import MainMenu from "../main-menu/MainMenu";
import EndgameModal from "../endgame-modal/EndgameModal";
import Loader from "../loader/Loader";
import SettingsModal from "../settings-modal/SettingsModal";
import validGuesses from "../../guesses/guesses.json";

type GameProps = {
  initialPuzzleData: ClientPuzzle;
}

const GUESSES_DB = "guessesDB";
const STORE_NAME = "guessesStore";
const CHUNK_SIZE = 500;

export default function Game({ initialPuzzleData }: GameProps) {
  const [loading, setLoading] = useState(true);
  const [puzzleData, setPuzzleData] = useState(initialPuzzleData);
  const [initializing, setInitializing] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [disableGameModeSelect, setDisableGameModeSelect] = useState<boolean>(false);
  const [showEndgameModal, setShowEndgameModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [gameState, setGameState] = useGameState();
  const [userStats, setUserStats] = useUserStats();
  const currentGame = gameState?.games && gameState.games[gameState.wordLength as WordLength];
  const wordData = puzzleData.words.find(word => word.length === gameState.wordLength)!;

  function resetGameState() {
    setGameState({
      ...gameState,
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
    // create IndexedDB for valid guesses if it doesn't exist
    const initializeDB = async () => {
      const db = await openDB(GUESSES_DB, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          }
        },
      });

      // Check if data already exists
      const count = await db.count(STORE_NAME);
      if (count === 0) {
        setInitializing(true);

        for (let i = 0; i < validGuesses.length; i += CHUNK_SIZE) {
          const chunk = validGuesses.slice(i, i + CHUNK_SIZE);
          const tx = db.transaction(STORE_NAME, 'readwrite');

          await Promise.all(chunk.map((guess) => tx.store.add({ guess })));

          await tx.done;
        }
      }

      setInitializing(false);
    };

    void initializeDB();
  }, [])

  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const date = new Date().toLocaleDateString();
        const puzzleData = await getPuzzle(date);
        setPuzzleData(puzzleData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      void fetchPuzzle();
    }

    if (!loading) {
      if (puzzleData.id !== gameState.puzzle) {
        resetGameState();
      }
    }
  }, [puzzleData.id, loading])

  if (loading || initializing) {
    return <Loader />
  }

  return (
    <>
      <Nav 
        disableGameModeSelect={disableGameModeSelect}
        setShowEndgameModal={setShowEndgameModal}
        setShowSettingsModal={setShowSettingsModal}
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
              setDisableGameModeSelect={setDisableGameModeSelect}
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
            {showSettingsModal && (
              <SettingsModal 
                showSettingsModal={showSettingsModal}
                setShowSettingsModal={setShowSettingsModal}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}