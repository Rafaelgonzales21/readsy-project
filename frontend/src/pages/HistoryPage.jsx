import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

// ── Colores para etiquetas ─────────────────────────────────────────────────────
const TAG_COLORS = [
    { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
    { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
    { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
    { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
];

const tagColor = (tag) => TAG_COLORS[tag.length % TAG_COLORS.length];

// ── Componente de etiquetas ────────────────────────────────────────────────────
function TagsEditor({ analysisId, initialTags, onUpdate }) {
    const [tags, setTags] = useState(initialTags);
    const [input, setInput] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        const val = input.trim().slice(0, 30);
        if (!val || tags.includes(val) || tags.length >= 5) return;
        const newTags = [...tags, val];
        setTags(newTags);
        setInput("");
        await save(newTags);
    };

    const handleRemove = async (tag) => {
        const newTags = tags.filter((t) => t !== tag);
        setTags(newTags);
        await save(newTags);
    };

    const save = async (newTags) => {
        setSaving(true);
        try {
            await api.put(`/api/analyses/${analysisId}/tags`, { tags: newTags });
            onUpdate(analysisId, newTags);
        } catch {
            // silencioso
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ marginTop: "0.75rem" }}>
            {/* Chips de etiquetas */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                {tags.map((tag) => {
                    const c = tagColor(tag);
                    return (
                        <span key={tag} style={{
                            display: "inline-flex", alignItems: "center", gap: "0.3rem",
                            padding: "0.2rem 0.6rem", borderRadius: 20,
                            fontSize: "0.72rem", fontWeight: 600,
                            background: c.bg, color: c.text,
                            border: `1px solid ${c.border}`,
                        }}>
                            {tag}
                            {editing && (
                                <button
                                    onClick={() => handleRemove(tag)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: c.text, fontSize: "0.9rem", lineHeight: 1, padding: 0 }}
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    );
                })}

                {/* Botón editar */}
                <button
                    onClick={() => setEditing((p) => !p)}
                    style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        padding: "0.2rem 0.55rem", borderRadius: 20,
                        border: "1px dashed #d4d4d4",
                        background: "transparent", color: "#737373",
                        cursor: "pointer", transition: "all 0.15s",
                    }}
                >
                    {editing ? "Listo" : tags.length === 0 ? "+ Añadir etiqueta" : "+ Editar"}
                </button>
            </div>

            {/* Input para añadir */}
            {editing && tags.length < 5 && (
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder="Nueva etiqueta (Enter para añadir)"
                        maxLength={30}
                        style={{
                            flex: 1, padding: "0.4rem 0.75rem",
                            border: "1px solid #e5e5e5", borderRadius: 8,
                            fontSize: "0.82rem", fontFamily: "inherit", outline: "none",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!input.trim() || saving}
                        style={{
                            padding: "0.4rem 0.875rem", borderRadius: 8,
                            border: "1px solid #0a0a0a",
                            background: "#0a0a0a", color: "#fff",
                            fontSize: "0.82rem", fontWeight: 600,
                            cursor: "pointer", flexShrink: 0,
                        }}
                    >
                        Añadir
                    </button>
                </div>
            )}
            {editing && tags.length >= 5 && (
                <p style={{ fontSize: "0.72rem", color: "#737373", marginTop: "0.4rem" }}>
                    Máximo 5 etiquetas por análisis.
                </p>
            )}
        </div>
    );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function HistoryPage() {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [filterTag, setFilterTag] = useState("");   // ← filtro por etiqueta

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

    function parseTags(raw) {
        try { return JSON.parse(raw || "[]"); } catch { return []; }
    }

    function parseResult(result) {
        try { return JSON.parse(result); } catch { return null; }
    }

    // Todas las etiquetas únicas del usuario para el filtro
    const allTags = [...new Set(analyses.flatMap((a) => parseTags(a.tags)))];

    // Filtrado combinado: búsqueda + etiqueta
    const filtered = analyses.filter((a) => {
        const result = parseResult(a.result);
        const tags = parseTags(a.tags);
        const matchesSearch = !search.trim() ||
            a.filename?.toLowerCase().includes(search.toLowerCase()) ||
            result?.document_title?.toLowerCase().includes(search.toLowerCase()) ||
            a.content?.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !filterTag || tags.includes(filterTag);
        return matchesSearch && matchesTag;
    });

    // Actualiza las etiquetas en el estado local sin recargar
    const handleTagsUpdate = (id, newTags) => {
        setAnalyses((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, tags: JSON.stringify(newTags) } : a
            )
        );
    };

    const handleSelect = (a) => {
        if (selected?.id === a.id) { setSelected(null); setMessages([]); }
        else { setSelected(a); setMessages([]); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/analyses/${id}`);
            setAnalyses((prev) => prev.filter((a) => a.id !== id));
            if (selected?.id === id) { setSelected(null); setMessages([]); }
        } catch { alert("Error al eliminar el análisis"); }
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
        } catch { alert("Error al exportar el PDF"); }
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
        } finally { setChatLoading(false); }
    };

    const formatDate = (iso) => new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                <header className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 className="display-font" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "0.5rem" }}>
                        Tu historial
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        {analyses.length} {analyses.length === 1 ? "documento analizado" : "documentos analizados"}
                    </p>
                </header>

                {/* Buscador */}
                {!loading && analyses.length > 0 && (
                    <div style={{ marginBottom: "1rem", position: "relative" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por título, nombre de archivo o contenido..."
                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafaf8", transition: "border-color 0.15s" }}
                            onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                            onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#737373", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, padding: 0 }}>×</button>
                        )}
                    </div>
                )}

                {/* Filtro por etiquetas */}
                {!loading && allTags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#737373", fontWeight: 600, marginRight: "0.25rem" }}>Filtrar:</span>
                        {allTags.map((tag) => {
                            const c = tagColor(tag);
                            const active = filterTag === tag;
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setFilterTag(active ? "" : tag)}
                                    style={{
                                        padding: "0.2rem 0.65rem", borderRadius: 20,
                                        fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                                        transition: "all 0.15s",
                                        background: active ? c.text : c.bg,
                                        color: active ? "#fff" : c.text,
                                        border: `1px solid ${c.border}`,
                                    }}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                        {filterTag && (
                            <button onClick={() => setFilterTag("")} style={{ fontSize: "0.72rem", color: "#737373", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                Quitar filtro
                            </button>
                        )}
                    </div>
                )}

                {search && (
                    <p style={{ fontSize: "0.82rem", color: "#737373", marginBottom: "1rem" }}>
                        {filtered.length === 0 ? "Sin resultados" : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
                    </p>
                )}

                {loading && <div style={{ color: "#737373", textAlign: "center", padding: "4rem" }}>Cargando historial...</div>}

                {!loading && analyses.length === 0 && (
                    <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                        <p style={{ color: "#737373", marginBottom: "1.5rem" }}>Todavía no has analizado ningún documento.</p>
                        <button className="btn-black" onClick={() => navigate("/")} style={{ padding: "0.75rem 1.5rem", borderRadius: 6 }}>Analizar mi primer documento</button>
                    </div>
                )}

                {!loading && analyses.length > 0 && filtered.length === 0 && (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "#737373" }}>No se encontraron análisis con ese criterio.</p>
                        <button onClick={() => { setSearch(""); setFilterTag(""); }} style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#0a0a0a", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
                            Limpiar filtros
                        </button>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {filtered.map((a) => {
                            const result = parseResult(a.result);
                            const isOpen = selected?.id === a.id;
                            const tags = parseTags(a.tags);

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
                                            <button onClick={() => handleSelect(a)} style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: 6, border: "1px solid #0a0a0a", background: isOpen ? "#0a0a0a" : "transparent", color: isOpen ? "#fff" : "#0a0a0a", cursor: "pointer", transition: "all 0.15s" }}>
                                                {isOpen ? "Cerrar" : "Ver análisis"}
                                            </button>
                                            <button onClick={() => handleExport(a.id, a.filename)} style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "transparent", color: "#404040", cursor: "pointer" }}>
                                                Exportar PDF
                                            </button>
                                            <button onClick={() => handleDelete(a.id)} style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: 6, border: "1px solid #fecdd3", background: "transparent", color: "#e11d48", cursor: "pointer" }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Etiquetas */}
                                    <TagsEditor
                                        analysisId={a.id}
                                        initialTags={tags}
                                        onUpdate={handleTagsUpdate}
                                    />

                                    {a.content && (
                                        <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", color: "#404040", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: isOpen ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: isOpen ? "visible" : "hidden" }}>
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
                                            <div style={{ borderTop: "1px solid #f2f2f2", paddingTop: "1.5rem" }}>
                                                <p style={{ fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#737373", marginBottom: "1rem" }}>
                                                    Pregunta sobre este documento
                                                </p>
                                                {messages.length > 0 && (
                                                    <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                                        {messages.map((m, i) => (
                                                            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.role === "user" ? "#0a0a0a" : "#f5f5f5", color: m.role === "user" ? "#fff" : "#404040", padding: "0.6rem 0.9rem", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", fontSize: "0.875rem", lineHeight: 1.5 }}>
                                                                {m.text}
                                                            </div>
                                                        ))}
                                                        {chatLoading && <div style={{ alignSelf: "flex-start", color: "#737373", fontSize: "0.82rem" }}>Analizando...</div>}
                                                        <div ref={chatEndRef} />
                                                    </div>
                                                )}
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()} placeholder="¿Qué quieres saber sobre este documento?" disabled={chatLoading} style={{ flex: 1, padding: "0.65rem 1rem", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: "0.88rem", fontFamily: "inherit", outline: "none" }} />
                                                    <button onClick={handleChat} disabled={chatLoading || !question.trim()} className="btn-black" style={{ padding: "0.65rem 1.25rem", borderRadius: 8, flexShrink: 0 }}>Preguntar</button>
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
            <footer style={{ borderTop: "1px solid #f2f2f2", padding: "1.5rem", textAlign: "center", fontSize: "0.75rem", color: "#d4d4d4", letterSpacing: "0.04em" }}>
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}