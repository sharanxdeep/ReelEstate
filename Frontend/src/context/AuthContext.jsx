import { createContext, useState } from "react";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const registerUser = async (email, name, password, phone) => {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, phone }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  };

  const toggleSaveListing = async (listingId) => {
    const res = await fetch(
      `http://localhost:3000/api/auth/save/${listingId}`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );
    const data = await res.json();
    if (res.ok) {
      setUser((prev) => {
        const updated = { ...prev, savedProperties: data.savedProperties };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, toggleSaveListing }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
