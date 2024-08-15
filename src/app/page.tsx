import { auth } from "~/root/auth"
import { api, HydrateClient } from "~/trpc/server";
import Nav from "./components/nav/Nav";
import styles from "./index.module.css";
import Playarea from "./components/playarea/Playarea";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  void session?.user && api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Nav />
      <main className={styles.main}>
        <Playarea />
      </main>
    </HydrateClient>
  );
}
