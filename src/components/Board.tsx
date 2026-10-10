import { useEffect, useState } from "react";
import { signIn } from "@/lib/auth/client";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bindHandle, checkPost, claimCoins, getMine, getPulse } from "@/lib/airdrop.functions";

type Row = { handle: string; coins: number };
type Drop = { tweetId: string; coins: number; claimed: boolean };

type Pulse = { week: string; resetAt: string; board: Row[] };
type Mine = Pulse & {
  needsX: boolean;
  handle: string | null;
  balance: number;
  waiting: number;
  drops: Drop[];
};

export function Board() {
  const { user, isPending } = useCurrentUserState();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [mine, setMine] = useState<Mine | null>(null);
  const [handle, setHandle] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      getPulse()
        .then(setPulse)
        .catch(() => setNote("The board could not load."));
      return;
    }
    getMine()
      .then((next) => {
        setMine(next);
        setPulse(next);
      })
      .catch(() => setNote("Sign in with X to open your coins."));
  }, [user, isPending]);

  const view = mine ?? pulse;
  const left = view ? Math.max(0, Date.parse(view.resetAt) - now) : 0;

  async function saveHandle() {
    setBusy(true);
    setNote("");
    try {
      const result = await bindHandle({ data: handle });
      if (!result.ok) setNote(result.error);
      else {
        setNote(`@${result.handle} is on the board.`);
        setMine(await getMine());
      }
    } catch {
      setNote("Sign in with X first.");
    } finally {
      setBusy(false);
    }
  }

  async function scan() {
    setBusy(true);
    setNote("");
    try {
      const result = await checkPost({ data: link });
      if (!result.ok) setNote(result.error);
      else {
        setLink("");
        setNote(`${result.coins} T3X is waiting. Claim it before Sunday.`);
        setMine(await getMine());
      }
    } catch {
      setNote("Sign in with X first.");
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    setBusy(true);
    setNote("");
    try {
      const result = await claimCoins();
      setNote(result.gained ? `${result.gained} T3X claimed.` : "Nothing waiting this week.");
      setMine(await getMine());
    } catch {
      setNote("Sign in with X first.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-5xl leading-none text-gold">T3X</p>
          <p className="mt-2 tracking-[0.28em] text-muted uppercase">Airdrop</p>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <section className="border border-line bg-surface p-5">
        <p className="text-sm tracking-[0.18em] text-gold uppercase">This week</p>
        <p className="mt-2 font-display text-4xl">{view ? `Week of ${view.week}` : "Opening the week"}</p>
        <p className="mt-2 text-muted">{view ? `Resets ${clock(left)}, Sunday midnight Sydney.` : "Sunday midnight Sydney."}</p>
        <p className="mt-4 max-w-xl text-fg">
          Sign in with X. Post with #T3X and #T3XDrop. We read the post on X. If it is yours and from this week, the coins wait here until you claim them.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3">
          <li className="border border-line px-3 py-3">50 T3X for signing in with X</li>
          <li className="border border-line px-3 py-3">100 T3X for each tagged post</li>
          <li className="border border-line px-3 py-3">Three posts, then Sunday clears the week</li>
        </ul>
      </section>

      <SignedOut>
        <button
          type="button"
          onClick={() => signIn("grok-x", { callbackURL: "/" })}
          className="min-h-12 bg-gold px-5 font-display text-2xl text-bg"
        >
          Sign in with X
        </button>
      </SignedOut>

      <SignedIn>
        {mine?.needsX ? (
          <button
            type="button"
            onClick={() => signIn("grok-x", { callbackURL: "/" })}
            className="min-h-12 bg-gold px-5 font-display text-2xl text-bg"
          >
            Sign in with X
          </button>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="border border-line p-5">
              <p className="text-sm text-muted">In your wallet</p>
              <p className="font-display text-5xl text-gold">{mine?.balance ?? 0}</p>
              <p className="mt-2 text-muted">Waiting this week: {mine?.waiting ?? 0}</p>
              <button type="button" disabled={busy || !mine?.waiting} onClick={claim} className="mt-4 min-h-11 bg-gold px-4 text-bg disabled:opacity-40">
                Claim
              </button>
            </div>
            <div className="border border-line p-5">
              {!mine?.handle ? (
                <>
                  <p className="text-sm text-muted">Your X handle</p>
                  <input
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    placeholder="@handle"
                    className="mt-3 w-full border border-line bg-bg px-3 py-3 text-fg outline-none"
                  />
                  <button type="button" disabled={busy} onClick={saveHandle} className="mt-3 min-h-11 border border-gold px-4 text-gold">
                    Save handle
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">Checking @{mine.handle}</p>
                  <input
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    placeholder="Link to the post"
                    className="mt-3 w-full border border-line bg-bg px-3 py-3 text-fg outline-none"
                  />
                  <button type="button" disabled={busy} onClick={scan} className="mt-3 min-h-11 border border-gold px-4 text-gold">
                    Check on X
                  </button>
                </>
              )}
            </div>
          </section>
        )}
        {mine && mine.drops.length > 0 && (
          <ul className="divide-y divide-line border border-line">
            {mine.drops.map((drop) => (
              <li key={drop.tweetId} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{drop.tweetId.startsWith("grant:") ? "Weekly sign-in" : "Tagged post"}</span>
                <span className="text-gold">
                  {drop.coins} {drop.claimed ? "claimed" : "waiting"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SignedIn>

      {note && <p className="text-gold">{note}</p>}

      <section>
        <h2 className="font-display text-3xl">Board</h2>
        <ol className="mt-3 divide-y divide-line border border-line">
          {(view?.board.length ? view.board : [{ handle: "No claims yet", coins: 0 }]).map((row) => (
            <li key={row.handle} className="flex items-center justify-between px-4 py-3">
              <span>{row.handle === "No claims yet" ? row.handle : `@${row.handle}`}</span>
              <span className="text-gold">{row.coins ? `${row.coins} T3X` : ""}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const tail = `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  return days ? `${days}d ${tail}` : tail;
}
