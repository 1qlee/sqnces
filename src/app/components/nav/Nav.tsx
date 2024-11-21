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

  return (
    <nav className={styles.nav}>
      <div className={styles.section}>
        sqnces
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