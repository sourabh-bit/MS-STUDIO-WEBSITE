import { fetchWidgetConfig } from "@/lib/auth";

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void;
    sendOtp?: (
      identifier: string,
      onSuccess: (data: unknown) => void,
      onFailure: (error: unknown) => void,
    ) => void;
    verifyOtp?: (
      otp: string,
      onSuccess: (data: unknown) => void,
      onFailure: (error: unknown) => void,
    ) => void;
    retryOtp?: (
      channel: string | undefined,
      onSuccess: (data: unknown) => void,
      onFailure: (error: unknown) => void,
    ) => void;
  }
}

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID?.trim() || "";

// MSG91 documents both hosts as valid; try the primary first, fall back
// to the secondary if it fails to load (network block, regional issue).
const SCRIPT_URLS = ["https://verify.msg91.com/otp-provider.js", "https://verify.phone91.com/otp-provider.js"];

let initPromise: Promise<void> | null = null;

const loadScript = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });

// Loads MSG91's widget script and initializes it in headless mode
// (exposeMethods: true) so we keep our own login UI instead of MSG91's
// own hosted OTP popup — we just call their exposed send/verify/retry
// functions from our existing form. tokenAuth is fetched from our own
// backend at runtime rather than baked into the build, so it never sits
// in a static JS bundle file (widgetId alone is fine to ship in the build
// — it's not sensitive on its own).
export const initMsg91Widget = () => {
  if (initPromise) {
    return initPromise;
  }

  if (!WIDGET_ID) {
    return Promise.reject(new Error("MSG91 widget is not configured."));
  }

  initPromise = (async () => {
    const [, tokenAuth] = await Promise.all([
      (async () => {
        let lastError: unknown;

        for (const url of SCRIPT_URLS) {
          try {
            await loadScript(url);
            lastError = undefined;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (lastError) {
          throw lastError instanceof Error ? lastError : new Error("Failed to load the OTP widget.");
        }
      })(),
      fetchWidgetConfig(),
    ]);

    if (typeof window.initSendOTP !== "function") {
      throw new Error("MSG91 widget script did not load correctly.");
    }

    window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth,
      exposeMethods: true,
      success: () => {},
      failure: () => {},
    });
  })();

  return initPromise;
};

const extractMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || fallback);
  }

  return fallback;
};

export const sendWidgetOtp = async (mobile: string) => {
  await initMsg91Widget();

  return new Promise<void>((resolve, reject) => {
    if (typeof window.sendOtp !== "function") {
      reject(new Error("OTP widget is not ready yet. Please try again."));
      return;
    }

    window.sendOtp(
      `91${mobile}`,
      () => resolve(),
      (error) => reject(new Error(extractMessage(error, "Unable to send the code. Please try again."))),
    );
  });
};

// Resolves with the MSG91 access token, which must be sent to our backend
// to be verified server-side before it's trusted as a real login.
export const verifyWidgetOtp = async (otp: string) => {
  await initMsg91Widget();

  return new Promise<string>((resolve, reject) => {
    if (typeof window.verifyOtp !== "function") {
      reject(new Error("OTP widget is not ready yet. Please try again."));
      return;
    }

    window.verifyOtp(
      otp,
      (data) => {
        const accessToken =
          data && typeof data === "object" && "message" in data
            ? String((data as { message?: unknown }).message || "")
            : "";

        if (!accessToken) {
          reject(new Error("Couldn't verify that code. Please try again."));
          return;
        }

        resolve(accessToken);
      },
      (error) => reject(new Error(extractMessage(error, "Incorrect code. Please try again."))),
    );
  });
};

export const retryWidgetOtp = async () => {
  await initMsg91Widget();

  return new Promise<void>((resolve, reject) => {
    if (typeof window.retryOtp !== "function") {
      reject(new Error("OTP widget is not ready yet. Please try again."));
      return;
    }

    window.retryOtp(
      undefined,
      () => resolve(),
      (error) => reject(new Error(extractMessage(error, "Unable to resend the code. Please try again."))),
    );
  });
};
