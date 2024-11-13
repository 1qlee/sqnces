import styles from "./EndgameModal.module.css"
import modalStyles from "../info-modal/InfoModal.module.css"
import marginStyles from "../styles/Margin.module.css"
import flexStyles from "../styles/Flex.module.css"

import toast from "react-hot-toast"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import type { ClientPuzzle, GlobalStats } from "~/server/types/puzzle"
import type { Game, WordLength } from "../game/Game.types"
import useGameState from "~/app/hooks/useGameState"
import useUserStats from "~/app/hooks/useUserStats"
import { XCircle } from '@phosphor-icons/react'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Select from "../select/Select"
import Button from "../button/Button"
import Checkbox from "../checkbox/Checkbox"
import { getPuzzleStats } from "~/app/actions/getPuzzleStats"

type EndgameModalProps = {
  currentGame: Game;
  puzzleData: ClientPuzzle;
  showEndgameModal: boolean;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
}

const STAT_PLACEHOLDER = "...";

function EndgameModal({
  currentGame,
  puzzleData,
  showEndgameModal,
  setShowEndgameModal,
}: EndgameModalProps) {
  const [userStats] = useUserStats();
  const [gameState] = useGameState();
  const [hideSpoilers, setHideSpoilers] = useState<boolean | "indeterminate">(true);
  const [statsMode, setStatsMode] = useState(gameState.settings.hardMode ? "Hard Mode" : "Easy Mode")
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    timesPlayed: STAT_PLACEHOLDER,
    lettersUsed: STAT_PLACEHOLDER,
    timesGuessed: STAT_PLACEHOLDER,
    timesFailed: STAT_PLACEHOLDER,
    timesSolved: STAT_PLACEHOLDER,
    winRate: STAT_PLACEHOLDER,
  });
  const currentPuzzle = puzzleData.words.find(word => word.length === gameState.wordLength)!;
  const isGameOver = currentGame.status === "won" || currentGame.status === "lost";
  const totalGuesses = currentGame.guesses.length;
  const totalLettersUsed = currentGame.guesses.reduce((acc, guess) => guess.word.length + acc, 0);
  const difficulty = statsMode === "Hard Mode" ? "hardMode" : "easyMode";
  const currentGameStats = userStats.games[gameState.wordLength as WordLength][difficulty];

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
              <p>The word was: <b>{currentGame.word}</b></p>
            )}
            {isGameOver && (
              <>
                <div className={[flexStyles.flexList, marginStyles.mb4].join(" ")}>
                  <p>
                    Puzzle Stats
                  </p>
                </div>
                <div className={[flexStyles.flexList, marginStyles.mb5].join(" ")}>
                  <div className={flexStyles.flexItem}>
                    <p className={flexStyles.flexHeading}>Guesses Made</p>
                    {totalGuesses}
                  </div>
                  <div className={flexStyles.flexItem}>
                    <p className={flexStyles.flexHeading}>Letters Used</p>
                    {totalLettersUsed}
                  </div>
                </div>
              </>
            )}
            <div className={[flexStyles.flexList, marginStyles.mb4].join(" ")}>
              <p>Global Stats</p>
            </div>
            <div className={[flexStyles.flexList, marginStyles.mb5].join(" ")}>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Avg Guesses Made</p>
                {globalStats?.timesGuessed}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Avg Letters Used</p>
                {globalStats?.lettersUsed}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Played</p>
                {globalStats?.timesPlayed}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Win %</p>
                {globalStats?.winRate}
              </div>
            </div>
            <div className={[flexStyles.flexList, marginStyles.mb4].join(" ")}>
              <p>
                Lifetime Stats ({gameState.wordLength})
              </p>
              <Select
                value={statsMode}
                onChange={val => setStatsMode(val)}
                options={[{ value: "Easy Mode", label: "Easy Mode" }, { value: "Hard Mode", label: "Hard Mode" }]}
              />
            </div>
            <div className={[flexStyles.flexList, marginStyles.mb5].join(" ")}>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Current Streak</p>
                {currentGameStats?.currentStreak ?? "N/A"}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Longest Streak</p>
                {currentGameStats?.longestStreak ?? "N/A"}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Played</p>
                {currentGameStats?.played ?? "N/A"}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Win %</p>
                {currentGameStats?.played > 0 ? `${Math.round((currentGameStats?.won / currentGameStats?.played) * 100)}%` : "N/A"}
              </div>
            </div>
            {(currentGame.status !== "playing" && currentGame.status !== "notStarted") && (
              <div className={styles.flex}>
                <Checkbox
                  text="Hide spoilers"
                  checked={hideSpoilers}
                  setChecked={setHideSpoilers}
                />
                <Button
                  onClick={async () => await handleCopyToClipboard()}
                  className={styles.button}
                >
                  Share results
                </Button>
              </div>
            )}
            <div
              className={styles.footer}
            >
              <p className={styles.footerText}>sqnces is currently in beta. Please <b><a href="mailto:sqnces@gmail.com">email me</a></b> if you have any feedback or notice any bugs.</p>
              <div
                className={styles.flex}
              >
                <a className={styles.donateButton} href="https://www.buymeacoffee.com/sqnces" target="_blank" rel="noreferrer noopener"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" /></a>
                <p>Support the development of sqnces by buying me a fine cup of coffee!</p>
              </div>
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