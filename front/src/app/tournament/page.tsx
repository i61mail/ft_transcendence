// app/tournament/page.tsx
import PongTournament from "./PongTournament";

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;         // unwrap the async value
  const code = sp.code ?? null;         // now this is safe
  return <PongTournament initialCode={code} />;
}
