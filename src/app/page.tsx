import { auth } from "~/root/auth"
import { api, HydrateClient } from "~/trpc/server";
import Nav from "./components/nav/Nav";
import Game from "./components/game/Game";
import { getWord } from "./actions/getWord";

export default async function Home() {
  const WORD_LENGTH = 6;
  const wordData = await getWord(WORD_LENGTH);
  // const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  void session?.user && api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Nav />
      <Game 
        wordData={wordData}
      />
    </HydrateClient>
  );
}
