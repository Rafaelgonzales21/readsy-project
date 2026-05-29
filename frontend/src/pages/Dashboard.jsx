import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

// ── Tarjeta de estadística ─────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
    return (
        <div className="card" style={{ padding: "1.5rem", flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>
                {label}
            </p>
            <p style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", lineHeight: 1 }}>
                {value ?? "—"}
            </p>
            {sub && (
                <p style={{ fontSize: "0.78rem", color: "#737373", marginTop: "0.35rem" }}>{sub}</p>
            )}
        </div>
    );
}

// ── Barra de actividad semanal (últimos 7 días) ────────────────────────────────
function ActivityBar({ analyses }) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("es-ES", { weekday: "short" });
        const dateStr = d.toISOString().slice(0, 10);
        const count = analyses.filter(a => a.created_at.slice(0, 10) === dateStr).length;
        days.push({ label, count });
    }
    const max = Math.max(...days.map(d => d.count), 1);

    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#737373", marginBottom: "1.25rem" }}>
                Actividad últimos 7 días
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 80 }}>
                {days.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                        <div style={{
                            width: "100%",
                            height: `${(d.count / max) * 64}px`,
                            minHeight: d.count > 0 ? 8 : 3,
                            background: d.count > 0 ? "#0a0a0a" : "#f0f0f0",
                            borderRadius: 4,
                            transition: "height 0.3s",
                        }} />
                        <span style={{ fontSize: "0.68rem", color: "#737373", textTransform: "capitalize" }}>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Página principal del dashboard ────────────────────────────────────────────
export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [allAnalyses, setAllAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/api/dashboard/stats"),
            api.get("/api/analyses"),
        ])
            .then(([statsRes, analysesRes]) => {
                setStats(statsRes.data);
                setAllAnalyses(analysesRes.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                {/* Cabecera */}
                <header className="fade-up" style={{ marginBottom: "2.5rem" }}>
                    <h1 className="display-font" style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        color: "#0a0a0a",
                        marginBottom: "0.5rem",
                    }}>
                        Tu dashboard
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        {user?.email} · Miembro desde {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(user?.created_at))}
                    </p>
                </header>

                {loading ? (
                    <div style={{ color: "#737373", textAlign: "center", padding: "4rem" }}>
                        Cargando estadísticas...
                    </div>
                ) : (
                    <>
                        {/* Tarjetas de stats */}
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                            <StatCard
                                label="Total analizados"
                                value={stats?.total_analyses}
                                sub="documentos en total"
                            />
                            <StatCard
                                label="Esta semana"
                                value={stats?.analyses_this_week}
                                sub="últimos 7 días"
                            />
                            <StatCard
                                label="Este mes"
                                value={stats?.analyses_this_month}
                                sub="últimos 30 días"
                            />
                            <StatCard
                                label="Día más activo"
                                value={stats?.most_active_day ?? "—"}
                                sub="día con más análisis"
                            />
                        </div>

                        {/* Gráfico de actividad */}
                        <div style={{ marginBottom: "1rem" }}>
                            <ActivityBar analyses={allAnalyses} />
                        </div>

                        {/* Análisis recientes */}
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#737373" }}>
                                    Análisis recientes
                                </p>
                                <button
                                    onClick={() => navigate("/history")}
                                    style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0a0a0a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                                >
                                    Ver todos
                                </button>
                            </div>

                            {stats?.recent_analyses?.length === 0 ? (
                                <p style={{ color: "#737373", fontSize: "0.88rem" }}>
                                    Todavía no has analizado ningún documento.{" "}
                                    <span
                                        style={{ color: "#0a0a0a", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => navigate("/")}
                                    >
                                        Empieza aquí
                                    </span>
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {stats?.recent_analyses?.map((a) => (
                                        <div
                                            key={a.id}
                                            onClick={() => navigate("/history")}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "0.75rem 1rem",
                                                background: "#fafaf8",
                                                borderRadius: 8,
                                                cursor: "pointer",
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0ec"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "#fafaf8"}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0a0a0a", marginBottom: "0.15rem" }}>
                                                    {a.document_title || a.filename}
                                                </p>
                                                <p style={{ fontSize: "0.75rem", color: "#737373" }}>
                                                    {a.filename}
                                                </p>
                                            </div>
                                            <p style={{ fontSize: "0.75rem", color: "#737373", flexShrink: 0, marginLeft: "1rem" }}>
                                                {formatDate(a.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Acciones rápidas */}
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                            <button
                                className="btn-black"
                                onClick={() => navigate("/")}
                                style={{ padding: "0.75rem 1.5rem", borderRadius: 8, flex: 1 }}
                            >
                                Analizar nuevo documento
                            </button>
                            <button
                                onClick={() => navigate("/history")}
                                style={{
                                    padding: "0.75rem 1.5rem", borderRadius: 8, flex: 1,
                                    border: "1px solid #e5e5e5", background: "transparent",
                                    fontSize: "0.9rem", fontWeight: 600, color: "#404040",
                                    cursor: "pointer",
                                }}
                            >
                                Ver historial completo
                            </button>
                        </div>
                    </>
                )}
            </main>

            <footer style={{
                borderTop: "1px solid #f2f2f2", padding: "1.5rem",
                textAlign: "center", fontSize: "0.75rem",
                color: "#d4d4d4", letterSpacing: "0.04em",
            }}>
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}