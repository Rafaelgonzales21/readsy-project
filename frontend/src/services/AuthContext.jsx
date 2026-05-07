import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }){
    const[user, setUser] = useState(null);
    const[token, setToken] = useState(() => localStorage.getItem("readsy_token"));
    const[loading, setLoading] = useState(true);
    
    
    /* verificar que el token sigue siendo válido */
    useEffect(() => {
        if(!token){
            setLoading(false);
            return;
        }
    

        api.get("/api/auth/me").then((res) => setUser(res.data)).catch(() => {
            setToken(null);
            localStorage.removeItem("readsy_token");
            setUser(null);
        }).finally(()=> setLoading(false));
    }, [token]);

    const login = useCallback((newToken, userData)=> {
        localStorage.setItem("readsy_token", newToken);
        setToken(newToken);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("readsy_token")
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{user, token, login, logout, loading}}> 
            {children}
        </AuthContext.Provider>
    );
}

/* hook */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
    return ctx
}