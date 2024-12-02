import styles from "./EndgameModal.module.css"
import modalStyles from "../info-modal/InfoModal.module.css"
import marginStyles from "../styles/Margin.module.css"
import flexStyles from "../styles/Flex.module.css"
import clsx from "clsx"

import toast from "react-hot-toast"
import { type Dispatch, type SetStateAction, useEffect, useState, useRef } from "react"
import type { ClientPuzzle, GlobalStats } from "~/server/types/puzzle"
import type { Game, WordLength } from "../game/Game.types"
import useGameState from "~/app/hooks/useGameState"
import useUserStats from "~/app/hooks/useUserStats"
import { XCircle, CaretUp, CaretDoubleUp, CaretDown, CaretDoubleDown } from '@phosphor-icons/react'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Button from "../button/Button"
import Checkbox from "../checkbox/Checkbox"
import { getPuzzleStats } from "~/app/actions/getPuzzleStats"

type EndgameModalProps = {
  currentGame: Game;
  puzzleData: ClientPuzzle;
  showEndgameModal: boolean;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
}

function EndgameModal({
  currentGame,
  puzzleData,
  showEndgameModal,
  setShowEndgameModal,
}: EndgameModalProps) {
  const [userStats] = useUserStats();
  const [gameState] = useGameState();
  const [statsScrolledToEnd, setStatsScrolledToEnd] = useState(true);
  const [hideSpoilers, setHideSpoilers] = useState<boolean | "indeterminate">(true);
  const [globalStats, setGlobalStats] = useState<GlobalStats>();
  const currentPuzzle = puzzleData.words.find(word => word.length === gameState.wordLength)!;
  const totalGuesses = currentGame.guesses.length;
  const totalLettersUsed = currentGame.guesses.reduce((acc, guess) => guess.word.length + acc, 0);
  const difficulty = gameState.settings.hardMode ? "hardMode" : "easyMode";
  const currentGameStats = userStats.games[gameState.wordLength as WordLength][difficulty];
  const statsGridRef = useRef<HTMLDivElement>(null);

  async function handleCopyToClipboard() {
    if (navigator.clipboard && window.isSecureContext) {
      let textToCopy = `sqnces.com\n#${puzzleData.id} ${currentPuzzle?.sequence.string} (${gameState.wordLength}) ${gameState.games[gameState.wordLength as WordLength].hardMode ? "-Hard" : "-Easy"}\n`;
      toast.success("Copied!", { id: "copied" });

      currentGame.guesses.forEach(guess => {
        const { validationMap } = guess;

        if (hideSpoilers) {
          let numOfCorrect = 0, numOfIncorrect = 0, numOfMisplaced = 0, numOfEmpty = 0;

          validationMap.forEach(item => {
            switch(item.type) {
              case "correct":
                numOfCorrect++;
                break;
              case "incorrect":
              case "incorrectEmpty":
                numOfIncorrect++;
                break;
              case "misplaced":
              case "misplacedEmpty":
                numOfMisplaced++;
                break;
              case "empty":
                numOfEmpty++;
                break;
              default:
                break;
            }
          })

          textToCopy += `🟩 x${numOfCorrect} 🟥 x${numOfIncorrect} 🟨 x${numOfMisplaced} ⬜ x${numOfEmpty}`;
        }
        else {
          validationMap.forEach(item => {
            textToCopy += `${item.letter} `;

            switch (item.type) {
              case "correct":
                textToCopy += `🟩 `;
                break;
              case "incorrect":
                textToCopy += `🟥 `;
                break;
              case "misplaced":
                textToCopy += `🟨 `;
                break;
              case "empty":
                textToCopy += `⬜ `;
                break;
              default:
                textToCopy += `⬛ `;
                break;
            }
          })
        }

        textToCopy += "\n";
      })

      await navigator.clipboard.writeText(textToCopy);
    }
  }

  function checkScrollPosition() {
    if (statsGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = statsGridRef.current;
      const hasNotReachedEnd = scrollLeft + clientWidth < scrollWidth;
      setStatsScrolledToEnd(hasNotReachedEnd);
    }
  };

  function statIndicator(userStat: number, globalStat: number, threshold = 0.5) {
    if (!globalStat || !userStat || globalStat === 0 || userStat === 0) { 
      return;
    }

    if (userStat === globalStat) {
      return;
    }
    else if (userStat > globalStat) {
      if (userStat - globalStat > threshold) {
        return <CaretDoubleUp size={12} color="var(--off)" weight="fill" />;
      }
      else {
        return <CaretUp size={12} color="var(--off)" weight="fill" />;
      }
    }
    else {
      if (globalStat - userStat > threshold) {
        return <CaretDoubleDown size={12} color="var(--on)" weight="fill" />;
      }
      else {
        return <CaretDown size={12} color="var(--on)" weight="fill" />;
      }
    }
  }

  useEffect(() => {
    async function fetchPuzzleStats() {
      const data = await getPuzzleStats({ id: puzzleData.id, wordLength: gameState.wordLength });
      setGlobalStats(data);
    }

    void fetchPuzzleStats();
  }, []) 

  return (
    <Dialog.Root
      defaultOpen={false}
      open={showEndgameModal}
      onOpenChange={(open) => {
        setShowEndgameModal(open)
        setTimeout(() => {
          document.body.style.pointerEvents = '';
        }, 0);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={modalStyles.modalOverlay} />
        <Dialog.Content
          className={modalStyles.modalContent}
          aria-describedby={undefined}
        >
          <div className={modalStyles.modalInner}>
            <h2 className={modalStyles.heading}>
              {currentGame.status === "won" ? "You won!" : currentGame.status === "lost" ? "You lost!" : "In Progress"}
            </h2>
            {currentGame.word && (
              <p className={marginStyles.mb4}>The word was: <b>{currentGame.word}</b></p>
            )}
            <div className={[flexStyles.flexList, marginStyles.mb4].join(" ")}>
              <p>
                Puzzle Stats ({gameState.wordLength} Letters)
              </p>
            </div>
            <div 
              ref={statsGridRef}
              className={clsx(styles.grid, {
                [styles.notScrolledToEnd!]: statsScrolledToEnd, // Apply this class if true
              })}
              onScroll={checkScrollPosition}
            >
              <div className={clsx(styles.gridColumn, styles.isFixed)}>
                <div className={clsx(styles.gridItem, styles.isSpaced)}> 
                  
                </div>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  You
                </div>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Others
                </div>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Lifetime
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Guesses Made
                </div>
                <div className={styles.gridItem}>
                  <span className={styles.stat}>
                    <span className={styles.statIndicator}>{statIndicator(totalGuesses, +(globalStats?.timesGuessed ?? 0), 1)}</span>
                    {totalGuesses}
                  </span>
                </div>
                <div className={styles.gridItem}>
                  {globalStats?.timesGuessed ?? "-"}
                </div>
                <div className={styles.gridItem}>
                  <span className={styles.stat}>
                    {currentGameStats?.timesGuessed ?? "-"}
                  </span>
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Letters Used
                </div>
                <div className={styles.gridItem}>
                  <span className={styles.stat}>
                    <span className={styles.statIndicator}>{statIndicator(totalLettersUsed, +(globalStats?.lettersUsed ?? 0), 3)}</span>
                    {totalLettersUsed ?? "-"}
                  </span>
                </div>
                <div className={styles.gridItem}>
                  {globalStats?.lettersUsed ?? "-"}
                </div>
                <div className={styles.gridItem}>
                  <span className={styles.stat}>
                    {currentGameStats?.lettersUsed ?? "-"}
                  </span>
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Times Played
                </div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>
                  -
                </div>
                <div className={styles.gridItem}>
                  {globalStats?.timesPlayed ?? "-"}
                </div>
                <div className={styles.gridItem}>
                  {currentGameStats?.timesPlayed ?? "-"}
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Win %
                </div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>
                  -
                </div>
                <div className={styles.gridItem}>
                  {globalStats?.winRate ? `${globalStats.winRate}%` : "-"}
                </div>
                <div className={styles.gridItem}>
                  {currentGameStats?.timesPlayed > 0 ? `${Math.round((currentGameStats?.won / currentGameStats?.timesPlayed) * 100)}%` : "-"}
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Current Streak
                </div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>-</div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>-</div>
                <div className={styles.gridItem}>
                  {currentGameStats?.currentStreak ?? "-"}
                </div>
              </div>
              <div className={styles.gridColumn}>
                <div className={clsx(styles.gridItem, styles.statHeading)}>
                  Longest Streak
                </div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>-</div>
                <div className={clsx(styles.gridItem, styles.isEmpty)}>-</div>
                <div className={styles.gridItem}>
                  {currentGameStats?.longestStreak ?? "-"}
                </div>
              </div>
            </div>
            {(currentGame.status !== "playing" && currentGame.status !== "notStarted") && (
              <div className={styles.flex}>
                <Button
                  onClick={async () => await handleCopyToClipboard()}
                  className={styles.button}
                >
                  Share results
                </Button>
                <Checkbox
                  text="Hide spoilers"
                  checked={hideSpoilers}
                  setChecked={setHideSpoilers}
                />
              </div>
            )}
            <div
              className={styles.footer}
            >
              <a className={styles.donateButton} href="https://www.buymeacoffee.com/sqnces" target="_blank" rel="noreferrer noopener"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" /></a>
              <p>Support the development of sqnces by buying me a fine cup of coffee!</p>
              <p className={styles.footerText}>Please <b><a href="mailto:sqnces.game@gmail.com">email me</a></b> if you have any feedback or notice any bugs.</p>
            </div>
          </div>
          <VisuallyHidden.Root asChild>
            <Dialog.Title>
              Endgame dialog
            </Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Close asChild>
            <button
              className={modalStyles.button}
              aria-label="Close"
            >
              <XCircle
                className={modalStyles.icon}
                size={32}
              />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default EndgameModal