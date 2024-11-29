import styles from "./Loader.module.css";
import wordStyles from "../guesses/Guesses.module.css";
import * as Progress from "@radix-ui/react-progress";
import clsx from "clsx";

type LoaderProps = {
  percent?: number;
  transition: string;
}

export default function Loader({ percent, transition }: LoaderProps) {
  const perc = percent && (100 - percent);

  return (
    <div className={clsx(styles.container, transition && styles[transition])}>
      <h1>{transition}</h1>
      <div className={styles.wrapper}>
        <div className={wordStyles.word}>
          <span className={clsx(wordStyles.letter, styles.letter)}>S</span>
          <span className={clsx(wordStyles.letter, styles.letter)}>Q</span>
          <span className={clsx(wordStyles.letter, styles.letter)}>N</span>
          <span className={clsx(wordStyles.letter, styles.letter)}>C</span>
          <span className={clsx(wordStyles.letter, styles.letter)}>E</span>
          <span className={clsx(wordStyles.letter, styles.letter)}>S</span>
        </div>
        <p className={styles.text}>Loading... {percent}</p>
        {/* <Progress.Root className={styles.progress} value={percent}>
          <Progress.Indicator
            className={styles.indicator}
            style={{ transform: `translateX(-${perc}%)`, transition: percent === 0 || percent === 100 ? 'none' : 'transform 0.2s ease-out', }}
          />
        </Progress.Root> */}
      </div>
    </div>
  )
}