"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "ydm_auth_token";
const USER_KEY = "ydm_auth_user";

export interface AuthUser {
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role?: "ydm" | "vendor" | "rider";
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUserContext: (updatedFields: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  isLoading: true,
  login: () => { },
  logout: () => { },
  updateUserContext: () => { },
});

// Pulls whatever fields are present in the JWT payload and merges them
// over the user object we already have, so the token is always treated
// as the source of truth for anything it carries.
function mergeUserFromToken(token: string, baseUser: AuthUser): AuthUser {
  let merged = { ...baseUser };
  try {
    const decoded: any = jwtDecode(token);
    let role = decoded.role ?? merged.role;
    if (role && (role === "YDM_Rider" || role.toLowerCase() === "rider")) {
      role = "rider";
    }
    merged = {
      ...merged,
      user_id: decoded.user_id ?? merged.user_id,
      email: decoded.email || merged.email,
      first_name: decoded.first_name || merged.first_name,
      last_name: decoded.last_name || merged.last_name,
      phone_number: decoded.phone_number ?? merged.phone_number,
      address: decoded.address ?? merged.address,
      role: role,
    };
  } catch (e) {
    console.error("Failed to decode token", e);
  }
  return merged;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        let parsedUser: AuthUser = JSON.parse(storedUser);

        if (storedToken) {
          parsedUser = mergeUserFromToken(storedToken, parsedUser);
        }

        setUser(parsedUser);
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    let normalizedUser = { ...newUser };
    if (normalizedUser.role && ((normalizedUser.role as string) === "YDM_Rider" || (normalizedUser.role as string).toLowerCase() === "rider")) {
      normalizedUser.role = "rider";
    }
    const finalUser = mergeUserFromToken(newToken, normalizedUser);

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    setToken(newToken);
    setUser(finalUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUserContext = (updatedFields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}