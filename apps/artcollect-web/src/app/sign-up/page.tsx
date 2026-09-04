"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signUpAction, type SignUpState } from "@/lib/actions/auth-actions";

const initialState: SignUpState = {};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-sm flex-col justify-center bg-[#17130f] px-6">
      <Image src="/brand/monogram.png" alt="artcollect.co.ke" width={40} height={44} className="mb-6 h-10 w-auto" priority />
      <h1 className="font-serif text-3xl font-semibold text-zinc-50">Create an account</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Save favourites, track enquiries, and manage your listings.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-50 outline-none focus:border-violet-400"
          />
        </div>

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
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-50 outline-none focus:border-violet-400"
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-violet-500 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-violet-300 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
