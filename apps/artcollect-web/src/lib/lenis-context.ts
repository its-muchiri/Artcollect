"use client";

import { createContext } from "react";
import type Lenis from "lenis";

/**
 * Holds the single app-wide Lenis instance (or `null` before it mounts / on
 * the server). Kept in its own module — separate from the provider
 * component — so both `SmoothScrollProvider` and `useLenis` can import it
 * without a circular dependency.
 */
export const LenisContext = createContext<Lenis | null>(null);
