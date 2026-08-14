import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { fetchCurrentUser, logout as logoutRequest } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isModalOpen: boolean;
  requireAuth: (action: () => void) => void;
  closeLoginModal: () => void;
  handleAuthenticated: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
        return;
      }

      pendingActionRef.current = action;
      setIsModalOpen(true);
    },
    [user],
  );

  const closeLoginModal = useCallback(() => {
    pendingActionRef.current = null;
    setIsModalOpen(false);
  }, []);

  const handleAuthenticated = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setIsModalOpen(false);

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;

    if (pendingAction) {
      pendingAction();
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isModalOpen,
        requireAuth,
        closeLoginModal,
        handleAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
