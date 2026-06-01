import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

export default function HistoryPage() {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");           // ← NUEVO

    // Chat
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/api/analyses")
            .then((res) => setAnalyses(res.data))
            .catch(() => setAnalyses([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Filtrado por búsqueda ──────────────────────────────────────────────────
    const filtered = analyses.filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const result = parseResult(a.result);
        return (
            a.filename?.toLowerCase().includes(q) ||
            result?.document_title?.toLowerCase().includes(q) ||
            a.content?.toLowerCase().includes(q)
        );
    });

    const handleSelect = (a) => {
        if (selected?.id === a.id) {
            setSelected(null);
            setMessages([]);
        } else {
            setSelected(a);
            setMessages([]);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/analyses/${id}`);
            setAnalyses((prev) => prev.filter((a) => a.id !== id));
            if (selected?.id === id) { setSelected(null); setMessages([]); }
        } catch {
            alert("Error al eliminar el análisis");
        }
    };

    const handleExport = async (id, filename) => {
        try {
            const res = await api.get(`/api/analyses/${id}/export`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `readsy_${filename.replace(".pdf", "")}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Error al exportar el PDF");
        }
    };

    const handleChat = async () => {
        if (!question.trim() || !selected) return;
        const userMsg = { role: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setChatLoading(true);
        try {
            const res = await api.post(`/api/analyses/${selected.id}/chat`, { question: userMsg.text });
            setMessages((prev) => [...prev, { role: "assistant", text: res.data.answer }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", text: "Error al obtener respuesta." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const formatDate = (iso) => new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    function parseResult(result) {
        try { return JSON.parse(result); } catch { return null; }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                {/* Cabecera */}
                <header className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 className="display-font" style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 900, letterSpacing: "-0.03em",
                        color: "#0a0a0a", marginBottom: "0.5rem",
                    }}>
                        Tu historial
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        {analyses.length} {analyses.length === 1 ? "documento analizado" : "documentos analizados"}
                    </p>
                </header>

                {/* ── BUSCADOR ── */}
                {!loading && analyses.length > 0 && (
                    <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                        {/* Icono lupa */}
                        <svg
                            width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="#737373" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        >
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por título, nombre de archivo o contenido..."
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem 0.75rem 2.5rem",
                                border: "1px solid #e5e5e5",
                                borderRadius: 10,
                                fontSize: "0.92rem",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.15s",
                                background: "#fafaf8",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                            onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                        />
                        {/* Botón limpiar búsqueda */}
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    position: "absolute", right: "0.875rem", top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none", border: "none",
                                    color: "#737373", cursor: "pointer",
                                    fontSize: "1.1rem", lineHeight: 1, padding: 0,
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}

                {/* Resultado de la búsqueda */}
                {search && (
                    <p style={{ fontSize: "0.82rem", color: "#737373", marginBottom: "1rem" }}>
                        {filtered.length === 0
                            ? "Sin resultados para tu búsqueda"
                            : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${search}"`}
                    </p>
                )}

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
                        <button className="btn-black" onClick={() => navigate("/")}
                            style={{ padding: "0.75rem 1.5rem", borderRadius: 6 }}>
                            Analizar mi primer documento
                        </button>
                    </div>
                )}

                {!loading && analyses.length > 0 && filtered.length === 0 && (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "#737373" }}>
                            No se encontraron análisis que coincidan con "{search}".
                        </p>
                        <button
                            onClick={() => setSearch("")}
                            style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#0a0a0a", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}

                {/* Lista de análisis filtrada */}
                {!loading && filtered.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {filtered.map((a) => {
                            const result = parseResult(a.result);
                            const isOpen = selected?.id === a.id;

                            return (
                                <div key={a.id} className="card" style={{ padding: "1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0a0a0a", marginBottom: "0.25rem" }}>
                                                {result?.document_title || a.filename}
                                            </p>
                                            <p style={{ fontSize: "0.8rem", color: "#737373" }}>
                                                {a.filename} · {formatDate(a.created_at)}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                                            <button onClick={() => handleSelect(a)} style={{
                                                fontSize: "0.78rem", fontWeight: 600,
                                                padding: "0.35rem 0.75rem", borderRadius: 6,
                                                border: "1px solid #0a0a0a",
                                                background: isOpen ? "#0a0a0a" : "transparent",
                                                color: isOpen ? "#fff" : "#0a0a0a",
                                                cursor: "pointer", transition: "all 0.15s",
                                            }}>
                                                {isOpen ? "Cerrar" : "Ver análisis"}
                                            </button>
                                            <button onClick={() => handleExport(a.id, a.filename)} style={{
                                                fontSize: "0.78rem", fontWeight: 600,
                                                padding: "0.35rem 0.75rem", borderRadius: 6,
                                                border: "1px solid #e5e5e5",
                                                background: "transparent", color: "#404040",
                                                cursor: "pointer", transition: "all 0.15s",
                                            }}>
                                                Exportar PDF
                                            </button>
                                            <button onClick={() => handleDelete(a.id)} style={{
                                                fontSize: "0.78rem", fontWeight: 600,
                                                padding: "0.35rem 0.75rem", borderRadius: 6,
                                                border: "1px solid #fecdd3",
                                                background: "transparent", color: "#e11d48",
                                                cursor: "pointer", transition: "all 0.15s",
                                            }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {a.content && (
                                        <p style={{
                                            marginTop: "0.75rem", fontSize: "0.88rem",
                                            color: "#404040", lineHeight: 1.6,
                                            display: "-webkit-box",
                                            WebkitLineClamp: isOpen ? "unset" : 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: isOpen ? "visible" : "hidden",
                                        }}>
                                            {a.content}
                                        </p>
                                    )}

                                    {isOpen && result && (
                                        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f2f2f2", paddingTop: "1.5rem" }}>
                                            {result.main_ideas?.length > 0 && (
                                                <div style={{ marginBottom: "1.25rem" }}>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>Ideas principales</p>
                                                    <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                                                        {result.main_ideas.map((idea, i) => (
                                                            <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{idea}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.key_points?.length > 0 && (
                                                <div style={{ marginBottom: "1.25rem" }}>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>Puntos clave</p>
                                                    <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                                                        {result.key_points.map((point, i) => (
                                                            <li key={i} style={{ fontSize: "0.88rem", color: "#404040", marginBottom: "0.3rem", lineHeight: 1.5 }}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.conclusions && (
                                                <div style={{ marginBottom: "1.5rem" }}>
                                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem" }}>Conclusiones</p>
                                                    <p style={{ fontSize: "0.88rem", color: "#404040", lineHeight: 1.6 }}>{result.conclusions}</p>
                                                </div>
                                            )}

                                            {/* Chat */}
                                            <div style={{ borderTop: "1px solid #f2f2f2", paddingTop: "1.5rem" }}>
                                                <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "1rem" }}>
                                                    Pregunta sobre este documento
                                                </p>
                                                {messages.length > 0 && (
                                                    <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                                        {messages.map((m, i) => (
                                                            <div key={i} style={{
                                                                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                                                maxWidth: "80%",
                                                                background: m.role === "user" ? "#0a0a0a" : "#f5f5f5",
                                                                color: m.role === "user" ? "#fff" : "#404040",
                                                                padding: "0.6rem 0.9rem",
                                                                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                                                fontSize: "0.875rem", lineHeight: 1.5,
                                                            }}>
                                                                {m.text}
                                                            </div>
                                                        ))}
                                                        {chatLoading && (
                                                            <div style={{ alignSelf: "flex-start", color: "#737373", fontSize: "0.82rem" }}>Analizando...</div>
                                                        )}
                                                        <div ref={chatEndRef} />
                                                    </div>
                                                )}
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <input
                                                        value={question}
                                                        onChange={(e) => setQuestion(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                                                        placeholder="¿Qué quieres saber sobre este documento?"
                                                        disabled={chatLoading}
                                                        style={{ flex: 1, padding: "0.65rem 1rem", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit", outline: "none" }}
                                                    />
                                                    <button
                                                        onClick={handleChat}
                                                        disabled={chatLoading || !question.trim()}
                                                        className="btn-black"
                                                        style={{ padding: "0.65rem 1.25rem", borderRadius: 8, flexShrink: 0 }}
                                                    >
                                                        Preguntar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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