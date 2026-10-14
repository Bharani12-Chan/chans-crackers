
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

const StoreContext = createContext(null);

export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? {
        "Content-Type": "application/json"
      } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed: ${response.status}`
    );
  }

  return data;
}

export function StoreProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const data = await api("/api/session-state/me");
      setSession(data.user || null);
      return data.user || null;
    } catch {
      setSession(null);
      return null;
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  async function logout() {
    await api("/api/session-state/logout", {
      method: "POST"
    });

    setSession(null);
  }

  return (
    <StoreContext.Provider
      value={{
        session,
        loadingSession,
        refreshSession,
        logout
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return context;
}
