import { createFileRoute } from "@tanstack/react-router";
import { authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
      <div className="w-full border border-line bg-surface p-6">
        <p className="font-display text-5xl text-gold">T3X</p>
        <p className="mt-2 text-muted">Sign in with X to join the weekly drop.</p>
        {authEnabled ? (
          <button
            type="button"
            onClick={() => signIn("grok-x", { callbackURL: "/" })}
            className="mt-6 min-h-12 w-full bg-gold font-display text-2xl text-bg"
          >
            Sign in with X
          </button>
        ) : (
          <p className="mt-6 text-muted">Sign-in is off.</p>
        )}
      </div>
    </main>
  );
}
