import next from "eslint-config-next";

/**
 * eslint-config-next@16 exports a flat-config array directly (the old
 * `FlatCompat.extends("next/core-web-vitals", ...)` indirection now
 * crashes validating v16's flat shape against the legacy schema), so the
 * array is spread as-is. `eslint-plugin-jsx-a11y`'s alt-text rules ship
 * inside this config — the base for docs/11's decorative-vs-meaningful
 * alt lint pass.
 */
const eslintConfig = [
  ...next,
  {
    // docs/11: the ink-reveal pair is retired with the v1
    // editorial-glassmorphism direction — deliberately left in place but
    // unused, and not held to the v2 lint gate.
    ignores: ["docs/**", ".next/**", "node_modules/**", "src/components/ui/ink-reveal.tsx", "src/components/ui/ink-reveal-demo.tsx"],
  },
  {
    // docs/11's STRUCTURAL guarantee for the calm checkout, carried over
    // from tikoyetu-web's own config when the two apps merged: checkout
    // surfaces are linted to be INCAPABLE of importing the loud styles —
    // not just styled calmly, but unable to reach the pixel/graffiti/3D
    // modules at all. A stronger guarantee than a runtime test: the build
    // fails if someone tries. The scanner PWA (when it exists) gets the
    // same treatment. The single handwritten confirmation line on the
    // thank-you pages comes from @artcollect/ui, which stays allowed.
    files: [
      "src/components/TicketTierSelector.tsx",
      "src/components/DonationForm.tsx",
      "src/lib/actions/checkout-actions.ts",
      "src/lib/actions/donation-actions.ts",
      "src/app/(tickets)/orders/**",
      "src/app/(tickets)/donate/**",
      "src/app/(tickets)/donations/**",
      "src/app/(tickets)/lookup/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/components/pixel/**",
                "**/pixel*",
                "**/components/graffiti/**",
                "**/graffiti*",
                "three",
                "three/**",
                "@react-three/*",
                "@react-three/drei/**",
                "next/dynamic",
                "**/providers/SmoothScrollProvider",
                "**/canvas/SceneCanvas",
                "**/canvas/CollageHeroCanvas",
              ],
              message:
                "Checkout and lookup surfaces are calm by design (docs/11 Phase 5): no pixel sprites, graffiti, 3D, or the scroll/WebGL providers — one handwritten confirmation line and one vector icon set at most.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
