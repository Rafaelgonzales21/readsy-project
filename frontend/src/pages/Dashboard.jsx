import { useAuth } from "../services/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard de Readsy</h1>
      <p>Bienvenido, <strong>{user?.email}</strong> ({user?.role})</p>
      <p style={{ color: "#888" }}>
        Aquí irá el historial de análisis y el plan de estudio — Fase 3.
      </p>
      <button
        onClick={logout}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#534ab7",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}