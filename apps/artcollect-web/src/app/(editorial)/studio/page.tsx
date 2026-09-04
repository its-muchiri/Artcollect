import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

const STUDIO_ROLES = ["artist", "curator", "organiser", "admin"] as const;

/**
 * Minimal example of a role-gated route: artist/curator/organiser/admin
 * only, per the role model in docs/03_database_schema.md. Server-side
 * authorization only — there is no client-side-only gate to bypass.
 */
export default async function StudioPage() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");

  const canAccess = session.user.roles.some((role) => STUDIO_ROLES.includes(role as (typeof STUDIO_ROLES)[number]));
  if (!canAccess) redirect("/");

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 py-24">
      <h1 className="font-serif text-3xl font-semibold text-zinc-50">Studio</h1>
      <p className="mt-2 text-zinc-400">
        Signed in as {session.user.email} — roles: {session.user.roles.join(", ")}
      </p>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button
          type="submit"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/10 active:scale-95"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
