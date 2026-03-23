import React, { createContext, useContext, useState } from "react";

export type Role = "admin" | "vendeur";

const PASSWORDS: Record<Role, string> = {
  admin: "1234",
  vendeur: "5678",
};

type AuthContextType = {
  role: Role | null;
  login: (role: Role, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);

  const login = (selectedRole: Role, password: string): boolean => {
    if (password === PASSWORDS[selectedRole]) {
      setRole(selectedRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        login,
        logout,
        isAuthenticated: role !== null,
        isAdmin: role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
