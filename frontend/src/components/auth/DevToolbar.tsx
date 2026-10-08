import { useEffect, useState } from "react";
import { LogIn, LogOut, Wrench, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchOtpDevMode } from "@/lib/auth";

// Floating helper shown only while the backend's developer OTP bypass is
// on (OTP_DEV_MODE). Renders nothing at all otherwise — real visitors never
// see it, because the production backend always reports dev mode as off.
const DevToolbar = () => {
  const { user, requireAuth, logout } = useAuth();
  const [isDevMode, setIsDevMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchOtpDevMode().then(setIsDevMode);
  }, []);

  if (!isDevMode) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 left-3 z-[60] inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 font-mono text-[11px] font-semibold text-amber-900 shadow-md lg:bottom-4"
      >
        <Wrench className="h-3.5 w-3.5" />
        DEV
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 left-3 z-[60] w-64 rounded-xl border border-amber-400 bg-amber-50 p-3 font-mono text-xs text-amber-950 shadow-lg lg:bottom-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Wrench className="h-3.5 w-3.5" />
          OTP dev mode
        </span>
        <button type="button" aria-label="Collapse dev tools" onClick={() => setIsExpanded(false)}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mb-2 leading-relaxed text-amber-900/80">
        No SMS is sent. Login codes appear inside the login popup.
      </p>

      <div className="mb-3 rounded-md bg-white/70 px-2 py-1.5">
        {user ? (
          <>
            <p className="truncate font-semibold">{user.name || "—"}</p>
            <p className="truncate">{user.phone}</p>
            <p className="truncate">{user.email}</p>
          </>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      {user ? (
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-900 px-3 py-1.5 text-amber-50 hover:bg-amber-800"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      ) : (
        <button
          type="button"
          onClick={() => requireAuth(() => undefined)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-900 px-3 py-1.5 text-amber-50 hover:bg-amber-800"
        >
          <LogIn className="h-3.5 w-3.5" />
          Open login
        </button>
      )}
    </div>
  );
};

export default DevToolbar;
