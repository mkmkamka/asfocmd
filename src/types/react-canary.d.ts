/// <reference types="react/canary" />

/* `<ViewTransition>` ships in the React build Next swaps in when
   `experimental.viewTransition` is on, but @types/react keeps it in the canary
   channel, which has to be pulled in explicitly. Once, anywhere in the project
   — hence a reference file rather than an `import {} from "react/canary"` in
   the layout: that module exists for TypeScript only, and the bundler fails to
   resolve it at build time.

   See src/app/[locale]/layout.tsx for the one component that needs it. */
export {};
