/**
 * Session Manager — controls where tokens are stored and handles
 * multi-tab coordination for "Remember Me" behaviour.
 *
 * Remember Me ON  → tokens in localStorage (persist across browser restarts).
 * Remember Me OFF → tokens in sessionStorage (per-tab), with a BroadcastChannel
 *                   to share the token with new tabs, and a tab counter so we
 *                   can call the logout endpoint when the LAST tab closes.
 *
 * Key concepts:
 * - `rememberMe` flag is always in localStorage so every tab can read it.
 * - `bp_tab_count` in localStorage tracks how many of our tabs are open.
 * - BroadcastChannel "bp_session" syncs the sessionStorage token to new tabs.
 * - On last-tab close (tabCount → 0 + rememberMe=false), we fire a
 *   `navigator.sendBeacon` to POST /Auth/logout so the server destroys the
 *   refresh token. Regular fetch won't complete during `beforeunload`.
 */

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const REMEMBER_KEY = "bp_remember_me";
const TAB_COUNT_KEY = "bp_tab_count";
const CHANNEL_NAME = "bp_session";

// ─── Storage helpers ─────────────────────────────────────────────────────────

/** Check if the user checked "Remember Me" on their last login. */
export const isRememberMe = () => localStorage.getItem(REMEMBER_KEY) === "true";

/** Get the correct Web Storage object based on the remember-me flag. */
const getStorage = () => (isRememberMe() ? localStorage : sessionStorage);

// ─── Token CRUD ──────────────────────────────────────────────────────────────

/**
 * Set the remember-me preference. Called once at login time.
 * When switching from remember → session, migrate tokens out of localStorage.
 */
export const setRememberMe = (value) => {
  const prev = isRememberMe();
  localStorage.setItem(REMEMBER_KEY, String(!!value));

  if (prev && !value) {
    // Was "remember", now "session" — move tokens to sessionStorage.
    const t = localStorage.getItem(TOKEN_KEY);
    const r = localStorage.getItem(REFRESH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    if (r) sessionStorage.setItem(REFRESH_KEY, r);
  } else if (!prev && value) {
    // Was "session", now "remember" — move tokens to localStorage.
    const t = sessionStorage.getItem(TOKEN_KEY);
    const r = sessionStorage.getItem(REFRESH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    if (r) localStorage.setItem(REFRESH_KEY, r);
  }
};

/** Store JWT + refresh token in the correct storage. */
export const storeTokens = (auth) => {
  const storage = getStorage();
  if (auth?.token) storage.setItem(TOKEN_KEY, auth.token);
  if (auth?.refreshtoken) storage.setItem(REFRESH_KEY, auth.refreshtoken);

  // Notify all other open tabs so they sync tokens and redirect to dashboard.
  broadcastLogin(auth);
};

/** Read the JWT access token from the correct storage. */
export const getToken = () => getStorage().getItem(TOKEN_KEY);

/** Read the refresh token from the correct storage. */
export const getRefreshToken = () => getStorage().getItem(REFRESH_KEY);

/** Returns true when a token exists. */
export const isAuthenticated = () => !!getToken();

/** Clear tokens from BOTH storages (used on logout / 401). */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
};

// ─── BroadcastChannel — sync sessionStorage across tabs ──────────────────────

let channel = null;

/**
 * Open the channel (safe to call multiple times; idempotent).
 * When a new tab opens, it broadcasts "request_token". Existing tabs respond
 * with "token_response" containing the current sessionStorage token.
 */
const initChannel = () => {
  if (channel) return;
  if (typeof BroadcastChannel === "undefined") return; // SSR / unsupported

  channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event) => {
    const {
      type,
      token,
      refreshToken,
      rememberMe: loginRememberMe,
    } = event.data || {};

    if (type === "request_token") {
      // Another tab asked for the token — share ours if we have it.
      const t = sessionStorage.getItem(TOKEN_KEY);
      const r = sessionStorage.getItem(REFRESH_KEY);
      if (t) {
        channel.postMessage({
          type: "token_response",
          token: t,
          refreshToken: r,
        });
      }
    }

    if (type === "token_response") {
      // We received a token from a sibling tab.
      if (token && !sessionStorage.getItem(TOKEN_KEY)) {
        sessionStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
      }
    }

    if (type === "login") {
      // Another tab logged in — sync tokens and navigate to dashboard.
      // Write the rememberMe flag first so getStorage() resolves correctly.
      localStorage.setItem(REMEMBER_KEY, String(!!loginRememberMe));
      const storage = loginRememberMe ? localStorage : sessionStorage;
      if (token) storage.setItem(TOKEN_KEY, token);
      if (refreshToken) storage.setItem(REFRESH_KEY, refreshToken);
      window.location.replace("/");
    }

    if (type === "logout") {
      // Another tab triggered logout — clear our storage too.
      clearTokens();
      window.location.href = "/login";
    }
  };
};

/** Broadcast current token to sibling tabs (used for new-tab token sharing). */
const broadcastToken = () => {
  if (!channel) return;
  const t = sessionStorage.getItem(TOKEN_KEY);
  const r = sessionStorage.getItem(REFRESH_KEY);
  if (t) {
    channel.postMessage({ type: "token_response", token: t, refreshToken: r });
  }
};

/**
 * Broadcast a login event so all open tabs sync tokens and redirect to the
 * dashboard. Works for both remember-me (localStorage) and session-only
 * (sessionStorage) modes — the rememberMe flag is included in the message
 * so receiving tabs can write to the correct storage.
 */
const broadcastLogin = (auth) => {
  if (!channel) initChannel();
  if (!channel) return;
  channel.postMessage({
    type: "login",
    token: auth?.token,
    refreshToken: auth?.refreshtoken,
    rememberMe: isRememberMe(),
  });
};

/** Ask sibling tabs for a token (called when a new tab opens). */
const requestToken = () => {
  if (!channel) return;
  channel.postMessage({ type: "request_token" });
};

/** Broadcast a logout event so all tabs clear and redirect. */
export const broadcastLogout = () => {
  if (!channel) return;
  channel.postMessage({ type: "logout" });
};

// ─── Tab counter ─────────────────────────────────────────────────────────────

const getTabCount = () =>
  parseInt(localStorage.getItem(TAB_COUNT_KEY) || "0", 10);
const setTabCount = (n) =>
  localStorage.setItem(TAB_COUNT_KEY, String(Math.max(0, n)));

/**
 * Call once when the app mounts (e.g. in App.jsx / main.jsx useEffect).
 * Returns a cleanup function to call on unmount / beforeunload.
 */
export const registerTab = () => {
  initChannel();

  // Increment tab counter.
  setTabCount(getTabCount() + 1);

  // If session mode and we have no token yet, ask sibling tabs.
  if (!isRememberMe() && !sessionStorage.getItem(TOKEN_KEY)) {
    requestToken();
  }

  // Listen for the tab closing.
  const handleBeforeUnload = () => {
    const count = getTabCount() - 1;
    setTabCount(count);

    // Last tab closing + session-only mode → fire logout beacon.
    if (count <= 0 && !isRememberMe()) {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) {
        logoutBeacon(token);
      }
      // Clean up the tab-count key too.
      localStorage.removeItem(TAB_COUNT_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  // Fallback for rememberMe=true: the native "storage" event fires in every
  // other tab when localStorage is written. Use it to detect a login on Tab A
  // and redirect if we are not already authenticated.
  const handleStorageLogin = (event) => {
    if (event.key === TOKEN_KEY && event.newValue && !isAuthenticated()) {
      window.location.replace("/");
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("storage", handleStorageLogin);

  // Return cleanup for React useEffect.
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("storage", handleStorageLogin);
    handleBeforeUnload(); // decrement count if React unmounts without unload
  };
};

// ─── Beacon logout ───────────────────────────────────────────────────────────

/**
 * Fire-and-forget POST to /Auth/logout using sendBeacon (works during
 * `beforeunload` unlike regular fetch). Falls back to keepalive fetch.
 */
const logoutBeacon = (token) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "";
  const url = `${baseUrl}/Auth/logout`;

  // sendBeacon can only send blobs / FormData — we send an empty JSON body
  // and put the Authorization in a Blob header trick. Unfortunately sendBeacon
  // doesn't support custom headers, so we fall back to fetch with keepalive.
  try {
    const success = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: "{}",
      keepalive: true, // ensures the request outlives the page
    });
    // We intentionally don't await — this is fire-and-forget.
    void success;
  } catch {
    // Best-effort. If this fails the server token will expire via TTL.
  }
};
