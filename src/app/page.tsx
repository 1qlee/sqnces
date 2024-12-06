// import { auth } from "~/root/auth"
import { HydrateClient } from "~/trpc/server";
import Game from "./components/game/Game";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();
  // void session?.user && api.post.getLatest.prefetch();
  
  return (
    <HydrateClient>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--grayed)",
            padding: "1rem",
            borderRadius: "0.25rem",
            width: "320px",
          }}
        >
          <h1>sqnces is currently down for maintenance. We will be back shortly!</h1>
        </div>
      </div>
    </HydrateClient>
  );
}
 