/**
 * Self-hosted font loading for Mendes.
 *
 * Production requirement: no runtime Google Fonts request. Fonts are
 * self-hosted via `next/font/local`.
 *
 * The licensed font files this depends on are not yet present in the
 * repository (see `src/assets/fonts/README.md` for exactly what's
 * expected and how to source them). Importing `next/font/local` with a
 * `src` path that doesn't exist fails the build, so this file is left
 * uncommented-but-unused: valid TypeScript, not imported anywhere, and
 * therefore never reaches the bundler. `tsc --noEmit` type-checks it
 * fine since it never resolves the string paths against disk.
 *
 * To activate: add the font files per the README above, then uncomment
 * everything below and import `displayFont` / `bodyFont` / `monoFont`
 * into `src/app/layout.tsx`, applying each `.variable` to the <html>
 * element's className.
 */

// import localFont from "next/font/local";
//
// export const displayFont = localFont({
//   src: "../assets/fonts/fraunces/Fraunces-Variable.woff2",
//   variable: "--font-display",
//   display: "swap",
// });
//
// export const bodyFont = localFont({
//   src: [
//     {
//       path: "../assets/fonts/ibm-plex-sans/IBMPlexSans-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/ibm-plex-sans/IBMPlexSans-Medium.woff2",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/ibm-plex-sans/IBMPlexSans-SemiBold.woff2",
//       weight: "600",
//       style: "normal",
//     },
//   ],
//   variable: "--font-body",
//   display: "swap",
// });
//
// export const monoFont = localFont({
//   src: [
//     {
//       path: "../assets/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/ibm-plex-mono/IBMPlexMono-Medium.woff2",
//       weight: "500",
//       style: "normal",
//     },
//   ],
//   variable: "--font-mono",
//   display: "swap",
// });

export {};
