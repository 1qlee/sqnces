"use client"

import { type Dispatch, type SetStateAction, useState } from "react"
import styles from "./EndgameModal.module.css"
import flexStyles from "../styles/Flex.module.css"
import useGameState from "~/app/hooks/useGameState"
import useUserStats from "~/app/hooks/useUserStats"

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Button from "../button/Button"
import Checkbox from "../checkbox/Checkbox"
import modalStyles from "../info-modal/InfoModal.module.css"
import toast from "react-hot-toast"
import type { ClientPuzzle } from "~/server/types/word"
import type { Game, WordLength } from "../game/Game.types"
import { XCircle } from '@phosphor-icons/react'

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
  const [hideSpoilers, setHideSpoilers] = useState<boolean | "indeterminate">(true);
  const currentPuzzle = puzzleData.words.find(word => word.length === gameState.wordLength)!;
  const gameMode = gameState.settings.hardMode === true ? "hardMode" : "easyMode";
  const currentGameStats = userStats.games[gameState.wordLength as WordLength][gameMode];
  const totalGamesPlayed = Object.values(userStats.games).reduce((total, gameModes) => {
    return total + Object.values(gameModes).reduce((modeTotal, stats) => modeTotal + stats.played, 0);
  }, 0);

  async function handleCopyToClipboard() {
    if (navigator.clipboard && window.isSecureContext) {
      let textToCopy = `sqnces.com\nPuzzle #${puzzleData.id} (${gameState.wordLength}) ${currentPuzzle?.sequence.string}${gameState.settings.hardMode ? " -Hard" : ""}\n`;
      toast.success("Copied!", { id: "copied" });

      currentGame.guesses.forEach(guess => {
        const { validationMap } = guess;
        // 🟥🟨🟩⬛🔳⬜;

        if (hideSpoilers) {
          let numOfCorrect = 0, numOfIncorrect = 0, numOfMisplaced = 0, numOfEmpty = 0;

          validationMap.forEach(item => {
            switch(item.type) {
              case "correct":
                numOfCorrect++;
                break;
              case "incorrect":
                numOfIncorrect++;
                break;
              case "misplaced":
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

  return (
    <Dialog.Root
      defaultOpen={false}
      open={showEndgameModal}
      onOpenChange={(open) => setShowEndgameModal(open)}
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
            <p className={modalStyles.text}>
              Stats ({gameState.wordLength}) -{gameState.settings.hardMode ? "Hard" : "Easy"}
            </p>
            <div className={flexStyles.flexList}>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Played</p>
                {currentGameStats.played}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Win %</p>
                {currentGameStats.played > 0 ? Math.round((currentGameStats.won / currentGameStats.played) * 100) : 0}%
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Current Streak</p>
                {currentGameStats.currentStreak}
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Longest Streak</p>
                {currentGameStats.longestStreak}
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