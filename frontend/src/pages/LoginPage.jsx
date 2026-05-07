import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar/Navbar";
import Icon from "../components/Icons/Icon";
import { P } from "../components/Icons/iconPaths";

export default function LoginPage() {
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({email: "", password:""});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
 
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
 
    try {
      const { data: tokenData } = await api.post("/api/auth/login", form);
      const { data: userData } = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      login(tokenData.access_token, userData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Navbar />
      <main style={{ maxWidth: 440, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <header className="fade-up" style={{ marginBottom: "3rem", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "1px solid #e5e5e5",
              borderRadius: 2,
              padding: "0.25rem 0.75rem",
              marginBottom: "1.5rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#737373",
            }}
          >
            <Icon path={P.zap} size={11} />
            Acceso Seguro
          </div>
          <h1 className="display-font" style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "0.8rem" }}>
            Bienvenido de nuevo
          </h1>
          <p style={{ color: "#737373", lineHeight: 1.6 }}>Ingresa tus credenciales para continuar con tus análisis académicos.</p>
        </header>

        <div className="card fade-up-1" style={{ padding: "2.5rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="email" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#404040" }}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                style={{
                  padding: "0.75rem 1rem",
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="password" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#404040" }}>Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  padding: "0.75rem 1rem",
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
              />
            </div>

            {error && (
              <p style={{ 
                fontSize: "0.85rem", 
                color: "#e11d48", 
                background: "#fff1f2", 
                padding: "0.75rem", 
                borderRadius: 4, 
                border: "1px solid #fecdd3" 
              }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-black" disabled={loading} style={{ width: "100%", padding: "0.85rem", borderRadius: 6, marginTop: "0.5rem" }}>
              {loading ? (
                <span className="ld">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  <Icon path={P.zap} size={14} stroke="#ffffff" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "#737373" }}>
            ¿No tienes cuenta?{" "}
            <Link to="/register" style={{ color: "#0a0a0a", fontWeight: 700, textDecoration: "none" }}>Regístrate gratis</Link>
          </p>
        </div>
      </main>
      <footer
        style={{
          borderTop: "1px solid #f2f2f2",
          padding: "2rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#d4d4d4",
          letterSpacing: "0.04em",
          marginTop: "auto"
        }}
      >
        READSY - ANALIZADOR ACADÉMICO CON IA
      </footer>
    </div>
  );
}
