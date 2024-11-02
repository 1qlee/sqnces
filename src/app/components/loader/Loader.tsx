import styles from "./Loader.module.css";
import * as Progress from "@radix-ui/react-progress";

type LoaderProps = {
  percent: number;
}

export default function Loader({ percent }: LoaderProps) {
  const perc = 100 - percent;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <p className={styles.text}>Loading... {percent}%</p>
        <Progress.Root className={styles.progress} value={percent}>
          <Progress.Indicator
            className={styles.indicator}
            style={{ transform: `translateX(-${perc}%)`, transition: percent === 0 || percent === 100 ? 'none' : 'transform 0.2s ease-out', }}
          />
        </Progress.Root>
      </div>
    </div>
  )
}