import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div className="w-full">
        <img src="/brand/t3x-coin.png" alt="" className="h-24 w-24 object-contain" />
        <p className="mt-6 font-display text-6xl">T3X</p>
        <p className="mt-2 text-muted">Sign in from the board with your X handle and a post.</p>
        <Link to="/" className="mt-8 flex min-h-14 w-full items-center justify-center bg-fg text-lg text-bg">
          Back to the board
        </Link>
      </div>
    </main>
  );
}
