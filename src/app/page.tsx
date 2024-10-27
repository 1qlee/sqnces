// import { auth } from "~/root/auth"
import { HydrateClient } from "~/trpc/server";
import Game from "./components/game/Game";
import { getPuzzle } from "./actions/getPuzzle";

export default async function Home() {
  const date = new Date().toLocaleDateString();
  const puzzleData = await getPuzzle(date);
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();
  // void session?.user && api.post.getLatest.prefetch();
  
  return (
    <HydrateClient>
      <Game 
        puzzleData={puzzleData}
      />
    </HydrateClient>
  );
}
 