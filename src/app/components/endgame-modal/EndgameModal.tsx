import { type Dispatch, type SetStateAction, useState } from "react"
import styles from "./EndgameModal.module.css"

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Checkbox from "../checkbox/Checkbox"
import modalStyles from "../info-modal/InfoModal.module.css"
import { XCircle } from '@phosphor-icons/react'
import type { Game } from "../game/Game.types"
import type { ClientPuzzle } from "~/server/types/word"
import Button from "../button/Button"
import toast from "react-hot-toast"

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
  const [hideSpoilers, setHideSpoilers] = useState<boolean | "indeterminate">(true);

  async function handleCopyToClipboard() {
    if (navigator.clipboard && window.isSecureContext) {
      let textToCopy = `sqnces.com\nPuzzle #${puzzleData.id}\n`;
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
              {currentGame.status === "won" ? "You won!" : "You lost!"}
            </h2>
            <p className={modalStyles.text}>
              Stats
            </p>
            <div className={styles.flex}>
              <div>
                <p className={styles.statHeading}>Played</p>
                0
              </div>
              <div>
                <p className={styles.statHeading}>Win %</p>
                0
              </div>
              <div>
                <p className={styles.statHeading}>Current Streak</p>
                0
              </div>
              <div>
                <p className={styles.statHeading}>Max Streak</p>
                0
              </div>
            </div>
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
                Share Results
              </Button>
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