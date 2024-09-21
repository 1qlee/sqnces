"use client";

import guessStyles from "../guesses/Guesses.module.css"
import styles from "./Modal.module.css";
import useGameState from "~/hooks/useGameState";
import * as Dialog from '@radix-ui/react-dialog';
import { XCircle, X, Empty, ArrowsLeftRight, Check } from "@phosphor-icons/react";

const Rule = ({ text }: { text: string }) => {
  return (
    <li 
      className={styles.rule}
    >
      <span>{text}</span>
    </li>
  )
}

const rules = [
  "Guesses MUST include the sequence in its entirety and in its original order.",
  "Guesses MUST be equal to, or longer than, 4 letters.",
  "Guesses CANNOT exceed the length of the hidden word.",
];

const exampleGuesses = [
  {
    text: <p className={styles.guessText}><b>V</b> does not exist in the hidden word, however a letter does exist in that position.</p>,
    letters: [
      {
        letter: "V",
        type: "isIncorrect",
        icon: <X size={10} weight="bold" />,
      },
      {
        letter: "E",
        type: "isSequence",
        icon: null,
      },
      {
        letter: "N",
        type: "isSequence",
        icon: null,
      },
      {
        letter: "T",
        type: "isSequence",
        icon: null,
      },
    ],
  },
  {
    text: <p className={styles.guessText}><b>E and R</b> are in positions where there are no letters. In this case, they exceed the length of the hidden word.</p>,
    letters: [
      {
        letter: "E",
        type: "isSequence",
        icon: null,
      },
      {
        letter: "N",
        type: "isSequence",
        icon: null,
      },
      {
        letter: "T",
        type: "isSequence",
        icon: null,
      },
      {
        letter: "E",
        type: "isEmpty",
        icon: <Empty size={10} weight="bold" />,
      },
      {
        letter: "R",
        type: "isEmpty",
        icon: <Empty size={10} weight="bold" />,
      },
    ],
  },
  {
    text: <p className={styles.guessText}><b>P</b> exists in the hidden word, but is in the wrong position.</p>,
    letters: [
      {
        letter: "S",
        type: "isIncorrect",
        icon: <X size={10} weight="bold" />,
      },
      {
        letter: "P",
        type: "isMisplaced",
        icon: <ArrowsLeftRight size={10} weight="bold" />,
      },
      {
        letter: "E",
        type: "sequence",
        icon: null,
      },
      {
        letter: "N",
        type: "sequence",
        icon: null,
      },
      {
        letter: "T",
        type: "sequence",
        icon: null,
      },
    ],
  },
  {
    text: <p className={styles.guessText}><b>P</b> is in the correct position.</p>,
    letters: [
      {
        letter: "P",
        type: "isCorrect",
        icon: <Check size={10} weight="bold" />,
      },
      {
        letter: "O",
        type: "isIncorrect",
        icon: <X size={10} weight="bold" />,
      },
      {
        letter: "T",
        type: "isIncorrect",
        icon: <X size={10} weight="bold" />,
      },
      {
        letter: "E",
        type: "sequence",
        icon: null,
      },
      {
        letter: "N",
        type: "sequence",
        icon: null,
      },
      {
        letter: "T",
        type: "sequence",
        icon: null,
      },
    ],
  },
  {
    text: <p className={styles.guessText}>The correct word was PARENT!</p>,
    letters: [
      {
        letter: "P",
        type: "isCorrect",
        icon: <Check size={10} weight="bold" />,
      },
      {
        letter: "A",
        type: "isCorrect",
        icon: <Check size={10} weight="bold" />,
      },
      {
        letter: "R",
        type: "isCorrect",
        icon: <Check size={10} weight="bold" />,
      },
      {
        letter: "E",
        type: "sequence",
        icon: null,
      },
      {
        letter: "N",
        type: "sequence",
        icon: null,
      },
      {
        letter: "T",
        type: "sequence",
        icon: null,
      },
    ],
  },
]

const Modal = () => {
  const [gameState, setGameState] = useGameState();

  return (
    <Dialog.Root
      defaultOpen={gameState?.showHelp}
      open={gameState?.showHelp}
      onOpenChange={(open) => setGameState({ ...gameState, showHelp: open })}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content className={styles.modalContent}>
          <Dialog.Title
            className={styles.title}
          >
            How to play
          </Dialog.Title>
          <div className={styles.modalInner}>
            <Dialog.Description>
              You are given a 3-letter sequence like the one below.
            </Dialog.Description>
            <div className={styles.sequence}>
              <span>
                E
              </span>
              <span>
                N
              </span>
              <span>
                T
              </span>
            </div>
            <Dialog.Description>
              Use the sequence to form guess-words and figure out what the hidden <b>6-letter</b> word is.
            </Dialog.Description>
            <ul
              className={styles.rules}
            >
              {rules.map((rule, index) => (
                <Rule
                  key={index}
                  text={rule}
                />
              ))}
            </ul>
            <h3 className={styles.subtitle}>Example Guesses</h3>
            {exampleGuesses.map((guess, index) => (
              <div className={styles.example} key={index}>
                <div
                  key={index}
                  className={guessStyles.word}
                >
                  {guess.letters.map((l, i) => (
                    <span
                      key={i}
                      className={`
                    ${guessStyles.letter}
                    ${guessStyles.noAnimation}
                    ${guessStyles[l.type]}
                  `}
                    >
                      {l.letter}
                      <span className={guessStyles.icon}>{l.icon}</span>
                    </span>
                  ))}
                </div>
                {guess.text}
              </div>
            ))}
            <div className={styles.footer}>
              <Dialog.Description>
                sqnces is currently in beta. There is a new word to guess every 60 seconds.
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close asChild>
            <button 
              className={styles.button}
              aria-label="Close"
            >
              <XCircle 
                className={styles.icon}
                size={32}
              />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
};

export default Modal;
