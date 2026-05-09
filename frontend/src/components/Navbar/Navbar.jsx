import { Link, useLocation } from "react-router-dom";
import Icon from "../Icons/Icon"
import { P } from "../Icons/iconPaths"
import { useAuth } from "../../services/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 1.5rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 28,
            height: 28,
            background: "#0a0a0a",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon path={P.book} size={15} stroke="#fff" />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "-0.02em",
            color: "#0a0a0a"
          }}>
            Readsy
          </span>
        </div>

        {/* Enlaces de navegación — solo cuando hay sesión */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Link
              to="/"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.35rem 0.75rem",
                borderRadius: 6,
                textDecoration: "none",
                color: location.pathname === "/" ? "#0a0a0a" : "#737373",
                background: location.pathname === "/" ? "#f5f5f5" : "transparent",
                transition: "all 0.15s",
              }}
            >
              Analizar
            </Link>
            <Link
              to="/history"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.35rem 0.75rem",
                borderRadius: 6,
                textDecoration: "none",
                color: location.pathname === "/history" ? "#0a0a0a" : "#737373",
                background: location.pathname === "/history" ? "#f5f5f5" : "transparent",
                transition: "all 0.15s",
              }}
            >
              Historial
            </Link>
          </div>
        )}

        {/* Sin sesión muestra el texto original */}
        {!user && (
          <span style={{
            fontSize: "0.75rem",
            color: "#737373",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          }}>
            Analizador Académico
          </span>
        )}

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{
              fontSize: "0.8rem",
              color: "#404040",
              fontWeight: 500,
            }}>
              {user.email}
            </span>
            <button
              onClick={logout}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#737373",
                background: "none",
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#0a0a0a";
                e.target.style.borderColor = "#0a0a0a";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#737373";
                e.target.style.borderColor = "#e5e5e5";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}