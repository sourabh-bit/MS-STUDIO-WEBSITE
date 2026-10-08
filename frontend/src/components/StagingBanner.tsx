import { useEffect } from "react";

// Set VITE_APP_ENV=staging on the staging Vercel project only. Never set it
// on the live project.
const IS_STAGING = import.meta.env.VITE_APP_ENV === "staging";

// Makes the staging site impossible to mistake for the real one, and keeps
// it out of Google (robots noindex) so test pages never show up in search
// results next to meerasakhrani.in. Renders nothing on the live site.
const StagingBanner = () => {
  useEffect(() => {
    if (!IS_STAGING) {
      return;
    }

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.title = `[STAGING] ${document.title}`;

    return () => {
      meta.remove();
    };
  }, []);

  if (!IS_STAGING) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[70] bg-amber-400 px-4 py-1 text-center font-mono text-[11px] font-semibold tracking-wide text-amber-950">
      STAGING — test site. Payments use the ICICI test gateway; data here is not real.
    </div>
  );
};

export default StagingBanner;
