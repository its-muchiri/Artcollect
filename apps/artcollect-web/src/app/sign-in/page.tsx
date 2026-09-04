"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signInAction, type SignInState } from "@/lib/actions/auth-actions";

const initialState: SignInState = {};

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-sm flex-col justify-center bg-[#17130f] px-6">
      <Image src="/brand/monogram.png" alt="artcollect.co.ke" width={40} height={44} className="mb-6 h-10 w-auto" priority />
      <h1 className="font-serif text-3xl font-semibold text-zinc-50">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-400">Welcome back.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-50 outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-zinc-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-50 outline-none focus:border-violet-400"
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-violet-500 py-3 text-sm font-medium text-white transition hover:bg-violet-400 active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-violet-300 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
