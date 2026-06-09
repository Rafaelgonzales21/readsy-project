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

// ── SVG estrella ───────────────────────────────────────────────────────────────
function StarIcon({ filled }) {
    return (
        <svg
            width="15" height="15" viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : "none"}
            stroke={filled ? "#f59e0b" : "#d4d4d4"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ display: "block", transition: "all 0.15s", flexShrink: 0 }}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

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
    const [filterTag, setFilterTag] = useState("");
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // ← NUEVO

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

    const allTags = [...new Set(analyses.flatMap((a) => parseTags(a.tags)))];
    const favCount = analyses.filter((a) => a.is_favorite).length; // ← NUEVO

    // Filtrado combinado: búsqueda + etiqueta + favoritos
    const filtered = analyses.filter((a) => {
        const result = parseResult(a.result);
        const tags = parseTags(a.tags);
        const matchesSearch = !search.trim() ||
            a.filename?.toLowerCase().includes(search.toLowerCase()) ||
            result?.document_title?.toLowerCase().includes(search.toLowerCase()) ||
            a.content?.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !filterTag || tags.includes(filterTag);
        const matchesFav = !showOnlyFavorites || a.is_favorite; // ← NUEVO
        return matchesSearch && matchesTag && matchesFav;
    });

    const handleTagsUpdate = (id, newTags) => {
        setAnalyses((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, tags: JSON.stringify(newTags) } : a
            )
        );
    };

    // ── Toggle favorito ── NUEVO ───────────────────────────────────────────────
    const handleToggleFavorite = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/api/analyses/${id}/favorite`);
            setAnalyses((prev) =>
                prev.map((a) => a.id === id ? { ...a, is_favorite: res.data.is_favorite } : a)
            );
        } catch {
            // silencioso
        }
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
                        {/* ← NUEVO: contador favoritos */}
                        {favCount > 0 && (
                            <span style={{ marginLeft: "0.5rem", color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                · <StarIcon filled={true} /> {favCount} {favCount === 1 ? "favorito" : "favoritos"}
                            </span>
                        )}
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

                {/* Filtro por etiquetas + favoritos ← NUEVO botón favoritos */}
                {!loading && (allTags.length > 0 || favCount > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#737373", fontWeight: 600, marginRight: "0.25rem" }}>Filtrar:</span>

                        {/* Botón favoritos ← NUEVO */}
                        {favCount > 0 && (
                            <button
                                onClick={() => setShowOnlyFavorites((p) => !p)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                    padding: "0.2rem 0.65rem", borderRadius: 20,
                                    fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                                    background: showOnlyFavorites ? "#f59e0b" : "#fffbeb",
                                    color: showOnlyFavorites ? "#fff" : "#92400e",
                                    border: "1px solid #fde68a", transition: "all 0.15s",
                                }}
                            >
                                <StarIcon filled={showOnlyFavorites} />
                                Favoritos ({favCount})
                            </button>
                        )}

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
                        {(filterTag || showOnlyFavorites) && (
                            <button onClick={() => { setFilterTag(""); setShowOnlyFavorites(false); }} style={{ fontSize: "0.72rem", color: "#737373", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                Quitar filtros
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
                        <button onClick={() => { setSearch(""); setFilterTag(""); setShowOnlyFavorites(false); }} style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#0a0a0a", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
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
                                <div key={a.id} className="card" style={{ padding: "1.5rem", borderLeft: a.is_favorite ? "3px solid #f59e0b" : "3px solid transparent" /* ← NUEVO borde */ }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            {/* ← NUEVO: estrella + título */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                                                <button
                                                    onClick={(e) => handleToggleFavorite(a.id, e)}
                                                    title={a.is_favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "1px", display: "flex", alignItems: "center" }}
                                                >
                                                    <StarIcon filled={a.is_favorite} />
                                                </button>
                                                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0a0a0a" }}>
                                                    {result?.document_title || a.filename}
                                                </p>
                                            </div>
                                            <p style={{ fontSize: "0.8rem", color: "#737373" }}>
                                                {a.filename} · {formatDate(a.created_at)}
                                                {(() => {
                                                    const r = parseResult(a.result);
                                                    if (!r?.reading_minutes) return null;
                                                    return (
                                                        <span style={{
                                                            marginLeft: "0.5rem",
                                                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                                                        }}>
                                                            ·
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                                            </svg>
                                                            {r.reading_minutes} min lectura
                                                        </span>
                                                    );
                                                })()}
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
                                                    <div style={{ flex: 1, position: "relative" }}>
                                                        <span style={{
                                                            position: "absolute", left: "0.75rem", top: "50%",
                                                            transform: "translateY(-50%)", pointerEvents: "none",
                                                            color: "#b0b0b0", display: "flex", alignItems: "center",
                                                        }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M15.238 10.8107L14.6692 12.504C14.458 13.1481 14.0984 13.7336 13.6195 14.213C13.1405 14.6924 12.5556 15.0523 11.9121 15.2637L10.1987 15.8329C10.1411 15.8519 10.0909 15.8885 10.0554 15.9377C10.0198 15.9869 10.0007 16.046 10.0007 16.1067C10.0007 16.1674 10.0198 16.2266 10.0554 16.2757C10.0909 16.3249 10.1411 16.3616 10.1987 16.3805L11.9121 16.9498C12.5493 17.1619 13.1284 17.5198 13.6032 17.9951C14.0781 18.4704 14.4357 19.05 14.6477 19.6878L15.2164 21.4027C15.2353 21.4604 15.2719 21.5106 15.3211 21.5462C15.3702 21.5818 15.4293 21.601 15.4899 21.601C15.5506 21.601 15.6097 21.5818 15.6588 21.5462C15.7079 21.5106 15.7446 21.4604 15.7635 21.4027L16.3538 19.7094C16.5657 19.0716 16.9233 18.492 17.3982 18.0167C17.8731 17.5414 18.4521 17.1835 19.0894 16.9714L20.8028 16.4021C20.8604 16.3832 20.9105 16.3465 20.9461 16.2973C20.9817 16.2482 21.0008 16.189 21.0008 16.1283C21.0008 16.0676 20.9817 16.0085 20.9461 15.9593C20.9105 15.9102 20.8604 15.8735 20.8028 15.8545L19.111 15.2637C18.4674 15.0523 17.8825 14.6924 17.4036 14.213C16.9246 13.7336 16.565 13.1481 16.3538 12.504L15.7851 10.7891C15.764 10.7321 15.7254 10.6832 15.6749 10.6494C15.6243 10.6157 15.5644 10.5988 15.5037 10.6012C15.443 10.6036 15.3846 10.6251 15.3368 10.6628C15.2891 10.7004 15.2545 10.7522 15.238 10.8107Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M6.80814 5.89669L6.39453 7.12817C6.24093 7.59665 5.9794 8.02241 5.63106 8.37106C5.28273 8.7197 4.85736 8.98147 4.3893 9.13521L3.14322 9.5492C3.10132 9.56298 3.06484 9.58966 3.03898 9.62541C3.01312 9.66117 2.99919 9.70419 2.99919 9.74833C2.99919 9.79248 3.01312 9.83549 3.03898 9.87125C3.06484 9.90701 3.10132 9.93368 3.14322 9.94747L4.3893 10.3615C4.85276 10.5157 5.27389 10.776 5.61926 11.1217C5.96462 11.4674 6.2247 11.8889 6.37882 12.3528L6.79244 13.6C6.80621 13.6419 6.83286 13.6784 6.86858 13.7043C6.90431 13.7302 6.94729 13.7441 6.99139 13.7441C7.03549 13.7441 7.07847 13.7302 7.1142 13.7043C7.14992 13.6784 7.17657 13.6419 7.19034 13.6L7.61966 12.3685C7.77379 11.9046 8.03387 11.4831 8.37923 11.1374C8.72459 10.7918 9.14573 10.5314 9.60919 10.3772L10.8553 9.96319C10.8972 9.9494 10.9336 9.92273 10.9595 9.88697C10.9854 9.85122 10.9993 9.8082 10.9993 9.76405C10.9993 9.71991 10.9854 9.67689 10.9595 9.64114C10.9336 9.60538 10.8972 9.57871 10.8553 9.56492L9.6249 9.13521C9.15684 8.98147 8.73147 8.7197 8.38313 8.37106C8.0348 8.02241 7.77327 7.59665 7.61966 7.12817L7.20605 5.88097C7.19071 5.83949 7.16265 5.80393 7.12589 5.77939C7.08913 5.75484 7.04555 5.74256 7.0014 5.7443C6.95724 5.74605 6.91477 5.76173 6.88006 5.7891C6.84535 5.81647 6.82017 5.85413 6.80814 5.89669Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M14.6572 2.47532L14.4504 3.09106C14.3736 3.3253 14.2429 3.53818 14.0687 3.71251C13.8945 3.88683 13.6818 4.01771 13.4478 4.09458L12.8248 4.30158C12.8038 4.30847 12.7856 4.32181 12.7727 4.33968C12.7597 4.35756 12.7528 4.37907 12.7528 4.40114C12.7528 4.42322 12.7597 4.44473 12.7727 4.4626C12.7856 4.48048 12.8038 4.49382 12.8248 4.50071L13.4478 4.7077C13.6795 4.78484 13.8901 4.91499 14.0628 5.08783C14.2355 5.26067 14.3655 5.47143 14.4426 5.70337L14.6494 6.32697C14.6563 6.34794 14.6696 6.36619 14.6875 6.37914C14.7053 6.39208 14.7268 6.39905 14.7489 6.39905C14.7709 6.39905 14.7924 6.39208 14.8103 6.37914C14.8281 6.36619 14.8415 6.34794 14.8483 6.32697L15.063 5.71123C15.1401 5.47929 15.2701 5.26853 15.4428 5.09569C15.6155 4.92285 15.826 4.7927 16.0578 4.71556L16.6808 4.50857C16.7017 4.50168 16.72 4.48834 16.7329 4.47046C16.7459 4.45259 16.7528 4.43108 16.7528 4.409C16.7528 4.38693 16.7459 4.36542 16.7329 4.34755C16.72 4.32967 16.7017 4.31633 16.6808 4.30944L16.0656 4.09458C15.8316 4.01771 15.6189 3.88683 15.4447 3.71251C15.2706 3.53818 15.1398 3.3253 15.063 3.09106L14.8562 2.46746C14.8485 2.44672 14.8345 2.42894 14.8161 2.41667C14.7977 2.4044 14.7759 2.39826 14.7539 2.39913C14.7318 2.4 14.7106 2.40784 14.6932 2.42153C14.6758 2.43521 14.6633 2.45404 14.6572 2.47532Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </span>
                                                        <input
                                                            value={question}
                                                            onChange={(e) => setQuestion(e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                                                            placeholder="La IA tiene el documento. Pregúntale lo que quieras..."
                                                            disabled={chatLoading}
                                                            style={{
                                                                width: "100%",
                                                                padding: "0.65rem 1rem 0.65rem 2.25rem",
                                                                border: "1px solid #e5e5e5",
                                                                borderRadius: 8,
                                                                fontSize: "0.88rem",
                                                                fontFamily: "inherit",
                                                                outline: "none",
                                                            }}
                                                        />
                                                    </div>
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
            <footer style={{ borderTop: "1px solid #f2f2f2", padding: "1.5rem", textAlign: "center", fontSize: "0.75rem", color: "#d4d4d4", letterSpacing: "0.04em" }}>
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}