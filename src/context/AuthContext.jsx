import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { observeAuth, signIn, signOut } from "../data/auth";
import { getErrorMessage, isDemo } from "../data/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () =>
      observeAuth(
        (nextUser) => {
          setUser(nextUser);
          setLoading(false);
          setError("");
        },
        (cause) => {
          setUser(null);
          setLoading(false);
          setError(getErrorMessage(cause));
        },
      ),
    [],
  );

  const login = useCallback(async (email, password) => {
    setError("");
    try {
      return await signIn(email, password);
    } catch (cause) {
      throw new Error(getErrorMessage(cause));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (cause) {
      throw new Error(getErrorMessage(cause));
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, isDemo }),
    [user, loading, error, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
