import styles from "./Keyboard.module.css";
import { Backspace, KeyReturn } from "@phosphor-icons/react/dist/ssr";
import { GuessProps } from "../playarea/Playarea";

const KeyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', "Backspace"],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', "Enter"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

export default function Keyboard({ guess, setGuess }: GuessProps) {
  return (
    <div className={styles.keyboard}>
      {KeyboardRows.map((row, i) => (
        <div 
          className={styles.row}
          key={i}
        >
          {row.map((key) => (
            <button
              key={key}
              className={styles.key}
              aria-label={key}
            >
              {key !== "Backspace" && key !== "Enter" && key}
              {key === "Backspace" && <Backspace size={20} />}
              {key === "Enter" && <KeyReturn size={20} />}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}