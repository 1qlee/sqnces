import guessStyles from "../guesses/Guesses.module.css"
import styles from "./InfoModal.module.css";
import useGameState from "~/hooks/useGameState";
import * as Dialog from '@radix-ui/react-dialog';
import { XCircle, X, Empty, ArrowsLeftRight, Check } from "@phosphor-icons/react";
import * as Tabs from "@radix-ui/react-tabs";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const Rule = ({ text }: { text: string }) => {
  return (
    <li 
      className={styles.rule}
    >
      <span>{text}</span>
    </li>
  )
}

function exampleGuesses(isHardMode: boolean) {
  return [
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
      text: (
        <p className={styles.guessText}>
          <b>E and R</b> are in positions where there are no letters. In this case, they exceed the length of the hidden word. Therefore, the hidden word must end in ENT.
          {isHardMode
            ? ""
            : (
              <>
                Also, <b>R</b> exists elsewhere in the hidden word.
              </>
            )}
        </p>
      ),
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
          type: isHardMode ? "isEmpty" : "isMisplacedEmpty",
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
          type: "isCorrect",
          icon: <Check size={10} weight="bold" />,
        },
        {
          letter: "N",
          type: "isCorrect",
          icon: <Check size={10} weight="bold" />,
        },
        {
          letter: "T",
          type: "isCorrect",
          icon: <Check size={10} weight="bold" />,
        },
      ],
    },
  ]
}

const rules = [
  "Guesses must include the sequence in its entirety and in its original order.",
  "Guesses must be at least 4 letters long.",
  "Guesses cannot exceed the length of the hidden word."
];

const shortcuts = [
  {
    text: "Delete letter",
    keys: ["Backspace"]
  },
  {
    text: "Delete guess",
    keys: ["Shift", "Backspace"]
  },
  {
    text: "Input blank tile",
    keys: ["Space"]
  },
  {
    text: "Submit guess",
    keys: ["Enter"]
  }
]

const tips = [
  "Possible guess words outnumber the amount of hidden words.",
  "There are no proper nouns in any hidden word list. Not on purpose, anyway. If you find one, please contact me for its removal.",
  "Plural forms of words that simply add an 'S' or 'ES' to the end of a word are not in any hidden word list.",
  "Past-tense conjugations of words that simply add a 'D' or 'ED' to the end of a word are not in any hidden word list.",
  "Words that end in 'ING' do not exist in any hidden word list.",
  "You can input a blank placeholder tile by pressing Space.",
  "Press any tile in your guess to replace the entire letter or delete it.",
  "Press any tile in any previous guess to copy it to your current guess. Doing this will also enable edit mode on the tile you selected.",
]

const InfoModal = () => {
  const [gameState, setGameState] = useGameState();
  const isHardMode = gameState.settings.hardMode;

  return (
    <Dialog.Root
      defaultOpen={gameState?.showHelp}
      open={gameState?.showHelp}
      onOpenChange={(open) => setGameState({ ...gameState, showHelp: open })}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content 
          className={styles.modalContent}
          aria-describedby={undefined}
        >
          <Tabs.Root
            defaultValue="howToPlay"
          >
            <Tabs.List
              className={styles.tabs}
            >
              <Tabs.Trigger
                value="howToPlay"
                className={styles.trigger}
              >
                How to Play
              </Tabs.Trigger>
              <Tabs.Trigger
                value="tips"
                className={styles.trigger}
              >
                Advanced Tips
              </Tabs.Trigger>
              <Tabs.Trigger
                value="shortcuts"
                className={styles.trigger}
              >
                Shortcuts
              </Tabs.Trigger>
            </Tabs.List>
            <div className={styles.modalInner}>
              <Tabs.Content
                value="howToPlay"
              >
                <VisuallyHidden.Root asChild>
                  <Dialog.Title>
                    How to play dialog
                  </Dialog.Title>
                </VisuallyHidden.Root>
                <p className={styles.text}>
                  You are given a 3-letter sequence like the one below.
                </p>
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
                <p className={styles.text}>
                  Use the sequence to form guess-words and figure out what the hidden word is.
                </p>
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
                <h3 className={styles.subtitle}>Example Guesses ({isHardMode ? "Hard mode" : "Easy mode"})</h3>
                <p className={styles.text}>For a 6-letter hidden word:</p>
                {exampleGuesses(isHardMode).map((guess, index) => (
                  <div className={styles.example} key={index}>
                    <div
                      key={index}
                      className={[guessStyles.word, guessStyles.isLeftAligned].join(" ")}
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
                          {l.type === "isMisplacedEmpty" ? (
                            <>
                              <span className={[guessStyles.icon, guessStyles.isLeft].join(" ")}><ArrowsLeftRight size={10} weight="bold" /></span>
                              <span className={guessStyles.icon}><Empty size={10} weight="bold" /></span>
                            </>
                          ) : (
                            <span className={guessStyles.icon}>{l.icon}</span>
                          )}
                        </span>
                      ))}
                    </div>
                    {guess.text}
                  </div>
                ))}
              </Tabs.Content>
              <Tabs.Content
                value="shortcuts"
              >
                <VisuallyHidden.Root asChild>
                  <Dialog.Title>
                    How to play dialog
                  </Dialog.Title>
                </VisuallyHidden.Root>
                <p className={styles.text}>
                  Use the following keyboard shortcuts to navigate the game.
                </p>
                {shortcuts.map((shortcut, index) => (
                  <div className={styles.shortcut} key={index}>
                    <span>{shortcut.text}</span>
                    <span>
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd
                            className={styles.kbd}
                          >
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && "+"}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </Tabs.Content>
              <Tabs.Content
                value="tips"
              >
                <VisuallyHidden.Root asChild>
                  <Dialog.Title>
                    How to play dialog
                  </Dialog.Title>
                </VisuallyHidden.Root>
                {tips.map((tip, index) => (
                  <div className={styles.rules} key={index}>
                    <li className={styles.rule}>{tip}</li>
                  </div>
                ))}
              </Tabs.Content>
              <div className={styles.footer}>
                Please <b><a href="mailto:sqnces.game@gmail.com">email me</a></b> if you have any feedback or notice any bugs.
              </div>
            </div>
          </Tabs.Root>
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

export default InfoModal;
