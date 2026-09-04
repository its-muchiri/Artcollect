import { PixelSpinner } from "@/components/pixel/PixelSpinner";

/**
 * Route-level loading state (docs/11 Phase 5): the code-generated pixel
 * spinner as a FUNCTIONAL status indicator, always paired with plain
 * text. Never imported by checkout surfaces (eslint-enforced; docs/11
 * non-negotiables).
 */
export default function EventLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <PixelSpinner />
      <p className="text-sm text-zinc-500" role="status">
        Loading event…
      </p>
    </div>
  );
}
