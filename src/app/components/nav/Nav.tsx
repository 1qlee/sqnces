"use client";
// import { auth } from "~/root/auth";
import Link from "next/link";
import styles from "./Nav.module.css";
import HowToPlayToggle from "../toggles/HowToPlayToggle";
import EndgameToggle from "../toggles/EndgameToggle";
import type { Dispatch, SetStateAction } from "react";
import SettingsToggle from "../toggles/SettingsToggle";
import GameModeSelect from "../game-mode-select/GameModeSelect";

type NavProps = {
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export default function Nav({
  setShowEndgameModal,
  setShowSettingsModal,
}: NavProps) {
  // const session = await auth();

  return (
    <nav className={styles.nav}>
      <div className={styles.section}>
        <Link href="/">
          sqnces
        </Link>
      </div>
      <div className={[styles.section, styles.isCentered].join(" ")}>
        <GameModeSelect />
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