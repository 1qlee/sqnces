"use client";
// import { auth } from "~/root/auth";
import Link from "next/link";
import styles from "./Nav.module.css";
import ColorModeToggle from "../toggles/ColorModeToggle";
import HowToPlayToggle from "../toggles/HowToPlayToggle";
import EndgameToggle from "../toggles/EndgameToggle";
import type { Dispatch, SetStateAction } from "react";

type NavProps = {
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
}

export default function Nav({
  setShowEndgameModal,
}: NavProps) {
  // const session = await auth();

  return (
    <nav className={styles.nav}>
      <Link href="/">
        sqnces
      </Link>
      <div className={styles.section}>
        <EndgameToggle
          className={styles.item}
          setShowEndgameModal={setShowEndgameModal}
        />
        <HowToPlayToggle 
          className={styles.item}
        />
        <ColorModeToggle 
          className={styles.item}
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