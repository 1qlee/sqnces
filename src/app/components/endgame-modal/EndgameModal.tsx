"use client"

import { type Dispatch, type SetStateAction, useState } from "react"
import styles from "./EndgameModal.module.css"
import flexStyles from "../styles/Flex.module.css"

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Checkbox from "../checkbox/Checkbox"
import modalStyles from "../info-modal/InfoModal.module.css"
import { XCircle } from '@phosphor-icons/react'
import type { Game } from "../game/Game.types"
import type { ClientPuzzle } from "~/server/types/word"
import Button from "../button/Button"
import toast from "react-hot-toast"
import useGameState from "~/app/hooks/useGameState"

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
  const [gameState] = useGameState();
  const getCurrentDate = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const currentDate = getCurrentDate();
  const currentPuzzle = puzzleData.words.find(word => word.length === gameState.wordLength)!;
  const [hideSpoilers, setHideSpoilers] = useState<boolean | "indeterminate">(true);

  async function handleCopyToClipboard() {
    if (navigator.clipboard && window.isSecureContext) {
      let textToCopy = `sqnces.com ${currentDate}\nPuzzle #${puzzleData.id} (${gameState.wordLength}) ${currentPuzzle?.sequence.string}${gameState.settings.hardMode ? " -Hard" : ""}\n`;
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
              {currentGame.status === "won" ? "You won!" : currentGame.status === "lost" ? "You lost!" : "New Game"}
            </h2>
            <p className={modalStyles.text}>
              Stats (coming soon...)
            </p>
            <div className={flexStyles.flexList}>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Played</p>
                0
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Win %</p>
                0
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Current Streak</p>
                0
              </div>
              <div className={flexStyles.flexItem}>
                <p className={flexStyles.flexHeading}>Longest Streak</p>
                0
              </div>
            </div>
            {currentGame.status !== "playing" && currentGame.status !== "notStarted" ? (
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
            ) : (
              <p>Your game is still in progress.</p>
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