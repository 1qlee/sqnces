// import { auth } from "~/root/auth"
import { HydrateClient } from "~/trpc/server";
import Game from "./components/game/Game";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();
  // void session?.user && api.post.getLatest.prefetch();
  
  return (
    <HydrateClient>
      <Game />
    </HydrateClient>
  );
}
 