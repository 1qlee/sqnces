"use client";

import { useState, useEffect } from "react";
import { getPuzzle } from "~/app/actions/getPuzzle";
import { openDB } from "idb";
import type { ClientPuzzle } from "~/server/types/word";
import type { WordLength } from "./Game.types";
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
import toast from "react-hot-toast";

const GUESSES_DB = "guessesDB";
const STORE_NAME = "guessesStore";
const CHUNK_SIZE = 500;
const CACHE_ERR_MSG = "Something went wrong. Your browser's cache might be full. Please try deleting the cache and refresh the page.";

export default function Game() {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState({
    status: true,
    percent: 0,
  });
  const [puzzleData, setPuzzleData] = useState<ClientPuzzle>({
    id: 0,
    words: [],
    date: "",
  });
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [disableGameModeSelect, setDisableGameModeSelect] = useState<boolean>(false);
  const [showEndgameModal, setShowEndgameModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [gameState, setGameState] = useGameState();
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
          hardMode: false,
        },
        7: {
          guesses: [],
          status: "notStarted",
          hardMode: false,
        },
        8: {
          guesses: [],
          status: "notStarted",
          hardMode: false,
        },
      },
      wordLength: 6,
    });
  }

  useEffect(() => {
    // Function to initialize IndexedDB with error handling
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
        for (let i = 0; i < validGuesses.length; i += CHUNK_SIZE) {
          try {
            const chunk = validGuesses.slice(i, i + CHUNK_SIZE);
            const tx = db.transaction(STORE_NAME, 'readwrite');

            const percent = Math.min(100, Math.floor((i / validGuesses.length) * 100));
            setInitializing({
              status: true,
              percent,
            });

            await Promise.all(chunk.map((guess) => tx.store.add({ guess })));
            await tx.done;
          } catch (error) {
            toast.error(CACHE_ERR_MSG, {
              duration: Infinity,
            })
            return; // Stop further processing if a chunk fails
          }
        }

        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const size = await store.count();

        if (size < validGuesses.length) {
          toast.error(CACHE_ERR_MSG, {
            duration: Infinity,
          })
        }
      }
      else {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const size = await store.count();
        await tx.done;

        if (size < validGuesses.length) {
          // Clear the store and reinitialize
          await db.clear(STORE_NAME);
          await initializeDB();
        }
      }

      setInitializing({
        status: false,
        percent: 100,
      });
    };

    // Execute initialization
    void initializeDB();
  }, [])

  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const date = new Date().toLocaleDateString();
        const puzzleData = await getPuzzle(date);
        setPuzzleData(puzzleData);
      } catch (error) {
        
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

  if (loading || initializing.status) {
    return <Loader percent={initializing.percent} />
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