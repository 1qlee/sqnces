"use client";
// import { auth } from "~/root/auth";
import styles from "./Nav.module.css";
import HowToPlayToggle from "../toggles/HowToPlayToggle";
import EndgameToggle from "../toggles/EndgameToggle";
import type { Dispatch, SetStateAction } from "react";
import SettingsToggle from "../toggles/SettingsToggle";
import GameModeSelect from "../game-mode-select/GameModeSelect";
import useGameState from "~/app/hooks/useGameState";

type NavProps = {
  disableGameModeSelect: boolean;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export default function Nav({
  disableGameModeSelect,
  setShowEndgameModal,
  setShowSettingsModal,
}: NavProps) {
  const [gameState, setGameState] = useGameState();
  // const session = await auth();

  if (!("games" in gameState) || !("settings" in gameState) || !("wordLength" in gameState) || !("puzzle" in gameState) || !("showHelp" in gameState)) {
    setGameState({
      games: {
        6: {
          guesses: [],
          status: "notStarted",
        },
        7: {
          guesses: [],
          status: "notStarted",
        },
        8: {
          guesses: [],
          status: "notStarted",
        },
      },
      showHelp: true,
      wordLength: 6,
      puzzle: 0,
      settings: {
        hardMode: false,
      }
    })
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.section}>
        <a className={styles.donate} href="https://www.buymeacoffee.com/sqnces" target="_blank" rel="noreferrer noopener"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" /></a>
      </div>
      <div className={[styles.section, styles.isCentered].join(" ")}>
        <GameModeSelect 
          disabled={disableGameModeSelect}
        />
      </div>
      <div className={[styles.section, styles.isRight].join(" ")}>
        <EndgameToggle
          className={styles.item}
          setShowEndgameModal={setShowEndgameModal}
        />
        <HowToPlayToggle 
          className={styles.item}
        />
        <SettingsToggle
          className={styles.item}
          setShowSettingsModal={setShowSettingsModal}
        />
        {/* <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className={styles.item}
        >
          {session ? "Sign out" : "Sign in"}
        </Link> */}
      </div>
    </nav>
  )
}