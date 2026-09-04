"use server";

import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { prisma } from "@artcollect/database";
import { signIn } from "@/auth";

export interface SignUpState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Self-serve sign-up. New accounts get the `buyer` role by default —
 * artist/curator/organiser/validator/admin roles are staff-granted (see
 * `UserRoleAssignment` in packages/database), never self-selected at
 * sign-up, per the role model in docs/03_database_schema.md.
 */
export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      roles: { create: { role: "buyer" } },
    },
  });

  // Signing the user in immediately re-runs `authorize()` against the row
  // we just created, rather than trusting the values already in hand —
  // one code path for "did these credentials work", not two.
  await signIn("credentials", { email, password, redirectTo: "/" });

  return {};
}

export interface SignInState {
  error?: string;
}

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // A successful `signIn` throws Next.js's own internal redirect signal
    // to perform the navigation — only a genuine `CredentialsSignin`
    // failure should be turned into form feedback; anything else
    // (including that redirect) must keep propagating.
    if (error instanceof CredentialsSignin) return { error: "Invalid email or password." };
    throw error;
  }

  return {};
}
