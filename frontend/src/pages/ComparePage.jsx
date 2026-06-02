import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

// ── Columna de un análisis ─────────────────────────────────────────────────────
function AnalysisColumn({ analysis, result, side, onClear }) {
    if (!analysis) {
        return (
            <div style={{
                flex: 1, minWidth: 0,
                border: "2px dashed #e5e5e5",
                borderRadius: 12,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "3rem 1.5rem", textAlign: "center",
                minHeight: 300,
            }}>
                <p style={{ fontSize: "0.88rem", color: "#737373", marginBottom: "0.5rem", fontWeight: 600 }}>
                    {side === "left" ? "Documento A" : "Documento B"}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#b0b0b0" }}>
                    Selecciona un análisis de la lista
                </p>
            </div>
        );
    }

    const accentColor = side === "left" ? "#0a0a0a" : "#534ab7";

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            {/* Cabecera de columna */}
            <div style={{
                background: accentColor, borderRadius: "12px 12px 0 0",
                padding: "1rem 1.25rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
                        {side === "left" ? "Documento A" : "Documento B"}
                    </p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                        {result?.document_title || analysis.filename}
                    </p>
                </div>
                <button onClick={onClear} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "#fff", fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.6rem", cursor: "pointer" }}>
                    Cambiar
                </button>
            </div>

            {/* Contenido */}
            <div style={{ border: `2px solid ${accentColor}`, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>

                {/* Metadatos */}
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f2f2f2", background: "#fafaf8" }}>
                    <p style={{ fontSize: "0.78rem", color: "#737373" }}>
                        {analysis.filename}
                        {result?.reading_minutes && (
                            <span style={{ marginLeft: "0.5rem" }}>· {result.reading_minutes} min lectura</span>
                        )}
                    </p>
                </div>

                {/* Resumen */}
                <Section title="Resumen" accent={accentColor}>
                    <p style={{ fontSize: "0.88rem", color: "#404040", lineHeight: 1.65 }}>
                        {result?.summary || analysis.content || "—"}
                    </p>
                </Section>

                {/* Ideas principales */}
                {result?.main_ideas?.length > 0 && (
                    <Section title="Ideas principales" accent={accentColor}>
                        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                            {result.main_ideas.map((idea, i) => (
                                <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{idea}</li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* Puntos clave */}
                {result?.key_points?.length > 0 && (
                    <Section title="Puntos clave" accent={accentColor}>
                        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                            {result.key_points.map((kp, i) => (
                                <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{kp}</li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* Conclusiones */}
                {result?.conclusions && (
                    <Section title="Conclusiones" accent={accentColor}>
                        <p style={{ fontSize: "0.88rem", color: "#404040", lineHeight: 1.65 }}>
                            {result.conclusions}
                        </p>
                    </Section>
                )}
            </div>
        </div>
    );
}

function Section({ title, accent, children }) {
    return (
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f2f2f2" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>
                {title}
            </p>
            {children}
        </div>
    );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function ComparePage() {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leftId, setLeftId] = useState(null);
    const [rightId, setRightId] = useState(null);
    const [selecting, setSelecting] = useState(null); // "left" | "right" | null
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/api/analyses")
            .then((res) => setAnalyses(res.data))
            .catch(() => setAnalyses([]))
            .finally(() => setLoading(false));
    }, []);

    function parseResult(raw) { try { return JSON.parse(raw); } catch { return null; } }

    const leftAnalysis = analyses.find((a) => a.id === leftId) || null;
    const rightAnalysis = analyses.find((a) => a.id === rightId) || null;
    const leftResult = leftAnalysis ? parseResult(leftAnalysis.result) : null;
    const rightResult = rightAnalysis ? parseResult(rightAnalysis.result) : null;

    const filteredForSelect = analyses.filter((a) => {
        const r = parseResult(a.result);
        const q = search.toLowerCase();
        return (
            a.filename?.toLowerCase().includes(q) ||
            r?.document_title?.toLowerCase().includes(q)
        );
    });

    const handleSelect = (id) => {
        if (selecting === "left") setLeftId(id);
        else setRightId(id);
        setSelecting(null);
        setSearch("");
    };

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                {/* Cabecera */}
                <header className="fade-up" style={{ marginBottom: "2.5rem" }}>
                    <h1 className="display-font" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "0.5rem" }}>
                        Comparador
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        Selecciona dos análisis para compararlos lado a lado
                    </p>
                </header>

                {/* Botones de selección cuando ninguno está elegido aún */}
                {(!leftId || !rightId) && !selecting && (
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                        {!leftId && (
                            <button onClick={() => setSelecting("left")} className="btn-black"
                                style={{ padding: "0.75rem 1.5rem", borderRadius: 8 }}>
                                + Elegir Documento A
                            </button>
                        )}
                        {!rightId && (
                            <button onClick={() => setSelecting("right")}
                                style={{ padding: "0.75rem 1.5rem", borderRadius: 8, border: "2px solid #534ab7", background: "transparent", color: "#534ab7", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                                + Elegir Documento B
                            </button>
                        )}
                    </div>
                )}

                {/* Panel de selección */}
                {selecting && (
                    <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0a0a0a" }}>
                                Selecciona el {selecting === "left" ? "Documento A" : "Documento B"}
                            </p>
                            <button onClick={() => { setSelecting(null); setSearch(""); }}
                                style={{ background: "none", border: "none", color: "#737373", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
                        </div>

                        {/* Buscador */}
                        <div style={{ position: "relative", marginBottom: "1rem" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o nombre de archivo..."
                                style={{ width: "100%", padding: "0.65rem 1rem 0.65rem 2.25rem", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafaf8" }}
                                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"} onBlur={(e) => e.target.style.borderColor = "#e5e5e5"} />
                        </div>

                        {loading && <p style={{ color: "#737373", fontSize: "0.88rem" }}>Cargando...</p>}

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 280, overflowY: "auto" }}>
                            {filteredForSelect
                                .filter((a) => a.id !== leftId && a.id !== rightId)
                                .map((a) => {
                                    const r = parseResult(a.result);
                                    return (
                                        <div key={a.id} onClick={() => handleSelect(a.id)}
                                            style={{ padding: "0.75rem 1rem", borderRadius: 8, border: "1px solid #e5e5e5", cursor: "pointer", transition: "all 0.15s", background: "#fff" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = selecting === "left" ? "#0a0a0a" : "#534ab7"; e.currentTarget.style.background = "#fafaf8"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.background = "#fff"; }}
                                        >
                                            <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0a0a0a", marginBottom: "0.15rem" }}>
                                                {r?.document_title || a.filename}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "#737373" }}>{a.filename}</p>
                                        </div>
                                    );
                                })}
                            {filteredForSelect.filter((a) => a.id !== leftId && a.id !== rightId).length === 0 && (
                                <p style={{ color: "#737373", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                                    No hay más análisis disponibles
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Comparador lado a lado */}
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                    <AnalysisColumn
                        analysis={leftAnalysis}
                        result={leftResult}
                        side="left"
                        onClear={() => { setLeftId(null); setSelecting("left"); }}
                    />

                    {/* Separador central */}
                    {(leftId || rightId) && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", paddingTop: "4rem", flexShrink: 0 }}>
                            <div style={{ width: 1, height: 40, background: "#e5e5e5" }} />
                            <span style={{ fontSize: "0.72rem", color: "#b0b0b0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>vs</span>
                            <div style={{ width: 1, height: 40, background: "#e5e5e5" }} />
                        </div>
                    )}

                    <AnalysisColumn
                        analysis={rightAnalysis}
                        result={rightResult}
                        side="right"
                        onClear={() => { setRightId(null); setSelecting("right"); }}
                    />
                </div>

                {/* Botones de acción cuando ambos están seleccionados */}
                {leftId && rightId && (
                    <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => { setLeftId(null); setRightId(null); }}
                            style={{ padding: "0.65rem 1.25rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "transparent", color: "#737373", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
                            Nueva comparación
                        </button>
                        <button onClick={() => navigate("/history")}
                            style={{ padding: "0.65rem 1.25rem", borderRadius: 8, border: "1px solid #0a0a0a", background: "transparent", color: "#0a0a0a", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
                            Volver al historial
                        </button>
                    </div>
                )}
            </main>

            <footer style={{ borderTop: "1px solid #f2f2f2", padding: "1.5rem", textAlign: "center", fontSize: "0.75rem", color: "#d4d4d4", letterSpacing: "0.04em" }}>
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}