// import { auth } from "~/root/auth";
import Link from "next/link";
import styles from "./Nav.module.css";
import ColorModeToggle from "../toggles/ColorModeToggle";
import HowToPlayToggle from "../toggles/HowToPlayToggle";

export default async function Nav() {
  // const session = await auth();

  return (
    <nav className={styles.nav}>
      <Link href="/">
        sqnces
      </Link>
      <div className={styles.section}>
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