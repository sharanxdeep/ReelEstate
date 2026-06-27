import { createContext, useState } from "react";
const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })

    const login = async (email, password) => {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        })

        const data = await response.json()
        if (response.ok) {
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
        }
        return data
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext