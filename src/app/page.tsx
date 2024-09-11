import { auth } from "~/root/auth"
import { api, HydrateClient } from "~/trpc/server";
import Nav from "./components/nav/Nav";
import Game from "./components/game/Game";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, number | undefined>;
}) {
  const wordLength = Number(searchParams.length) || 6;
  // const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  void session?.user && api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Nav />
      <Game 
        wordLength={wordLength}
      />
    </HydrateClient>
  );
}
