import { auth } from "~/root/auth";
import Link from "next/link";
import styles from "./Nav.module.css";
import ColorModeToggle from "../color-mode-toggle/colorModeToggle";

export default async function Nav() {
  const session = await auth();

  return (
    <nav className={styles.nav}>
      <Link href="/">
        sqnces
      </Link>
      <div className={styles.section}>
        <ColorModeToggle 
          className={styles.item}
        />
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className={styles.item}
        >
          {session ? "Sign out" : "Sign in"}
        </Link>
      </div>
    </nav>
  )
}