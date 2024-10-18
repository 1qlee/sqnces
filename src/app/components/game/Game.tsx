"use client";

import { useState, useEffect } from "react";
import { getPuzzle } from "~/app/actions/getPuzzle";

import Nav from "../nav/Nav";
import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";
import InfoModal from "../info-modal/InfoModal";
import MainMenu from "../main-menu/MainMenu";
import EndgameModal from "../endgame-modal/EndgameModal";
import useGameState from "~/app/hooks/useGameState";
import { ClientPuzzle } from "~/server/types/word";
import Loader from "../loader/Loader";

type GameProps = {
  initialPuzzleData: ClientPuzzle;
}

export default function Game({ initialPuzzleData}: GameProps) {
  const [loading, setLoading] = useState(true);
  const [puzzleData, setPuzzleData] = useState(initialPuzzleData);
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [showEndgameModal, setShowEndgameModal] = useState<boolean>(false);
  const [gameState, setGameState] = useGameState();
  const currentGame = gameState?.games && gameState.games[gameState.wordLength];
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
    async function fetchPuzzle() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const puzzleData = await getPuzzle(timezone);
        setPuzzleData(puzzleData);
      } catch(error) {
        setPuzzleData({
          words: [],
          id: 0,
          date: "",
        });
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      void fetchPuzzle();
    }

    if (!loading) {
      if (!gameState.puzzle || gameState.puzzle !== puzzleData.id) {
        resetGameState();
      }
    }

  }, [puzzleData.id, loading])

  if (loading) {
    return <Loader />
  }

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