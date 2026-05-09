import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

export default function HistoryPage() {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // análisis expandido
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/api/analyses")
            .then((res) => setAnalyses(res.data))
            .catch(() => setAnalyses([]))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/analyses/${id}`);
            setAnalyses((prev) => prev.filter((a) => a.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch {
            alert("Error al eliminar el análisis");
        }
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const parseResult = (result) => {
        try { return JSON.parse(result); } catch { return null; }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                <header className="fade-up" style={{ marginBottom: "3rem" }}>
                    <h1 className="display-font" style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        color: "#0a0a0a",
                        marginBottom: "0.5rem",
                    }}>
                        Tu historial
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        {analyses.length} {analyses.length === 1 ? "documento analizado" : "documentos analizados"}
                    </p>
                </header>

                {loading && (
                    <div style={{ color: "#737373", textAlign: "center", padding: "4rem" }}>
                        Cargando historial...
                    </div>
                )}

                {!loading && analyses.length === 0 && (
                    <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                        <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                            Todavía no has analizado ningún documento.
                        </p>
                        <button
                            className="btn-black"
                            onClick={() => navigate("/")}
                            style={{ padding: "0.75rem 1.5rem", borderRadius: 6 }}
                        >
                            Analizar mi primer documento
                        </button>
                    </div>
                )}

                {!loading && analyses.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {analyses.map((a) => {
                            const result = parseResult(a.result);
                            const isOpen = selected?.id === a.id;

                            return (
                                <div key={a.id} className="card" style={{ padding: "1.5rem" }}>
                                    {/* Cabecera del item */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: "1rem",
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontWeight: 700,
                                                fontSize: "0.95rem",
                                                color: "#0a0a0a",
                                                marginBottom: "0.25rem",
                                            }}>
                                                {result?.document_title || a.filename}
                                            </p>
                                            <p style={{ fontSize: "0.8rem", color: "#737373" }}>
                                                {a.filename} · {formatDate(a.created_at)}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                            <button
                                                onClick={() => setSelected(isOpen ? null : a)}
                                                style={{
                                                    fontSize: "0.78rem",
                                                    fontWeight: 600,
                                                    padding: "0.35rem 0.75rem",
                                                    borderRadius: 6,
                                                    border: "1px solid #0a0a0a",
                                                    background: isOpen ? "#0a0a0a" : "transparent",
                                                    color: isOpen ? "#fff" : "#0a0a0a",
                                                    cursor: "pointer",
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {isOpen ? "Cerrar" : "Ver análisis"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                style={{
                                                    fontSize: "0.78rem",
                                                    fontWeight: 600,
                                                    padding: "0.35rem 0.75rem",
                                                    borderRadius: 6,
                                                    border: "1px solid #fecdd3",
                                                    background: "transparent",
                                                    color: "#e11d48",
                                                    cursor: "pointer",
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Resumen siempre visible */}
                                    {a.content && (
                                        <p style={{
                                            marginTop: "0.75rem",
                                            fontSize: "0.88rem",
                                            color: "#404040",
                                            lineHeight: 1.6,
                                            display: "-webkit-box",
                                            WebkitLineClamp: isOpen ? "unset" : 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: isOpen ? "visible" : "hidden",
                                        }}>
                                            {a.content}
                                        </p>
                                    )}

                                    {/* Detalle expandido */}
                                    {isOpen && result && (
                                        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f2f2f2", paddingTop: "1.5rem" }}>

                                            {result.main_ideas?.length > 0 && (
                                                <div style={{ marginBottom: "1.25rem" }}>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>
                                                        Ideas principales
                                                    </p>
                                                    <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                                                        {result.main_ideas.map((idea, i) => (
                                                            <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{idea}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {result.key_points?.length > 0 && (
                                                <div style={{ marginBottom: "1.25rem" }}>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>
                                                        Puntos clave
                                                    </p>
                                                    <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                                                        {result.key_points.map((point, i) => (
                                                            <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {result.conclusions && (
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>
                                                        Conclusiones
                                                    </p>
                                                    <p style={{ fontSize: "0.88rem", color: "#404040", lineHeight: 1.6 }}>{result.conclusions}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer style={{
                borderTop: "1px solid #f2f2f2",
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#d4d4d4",
                letterSpacing: "0.04em",
            }}>
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}