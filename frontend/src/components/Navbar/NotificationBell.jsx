import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Carga notificaciones al montar y cada 30 segundos
    const fetchNotifications = () => {
        api.get("/api/notifications")
            .then((res) => setNotifications(res.data))
            .catch(() => {});
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Cierra el panel al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unread = notifications.filter((n) => !n.read).length;

    const handleOpen = () => {
        setOpen((prev) => !prev);
        // Marca como leídas al abrir
        if (!open && unread > 0) {
            api.put("/api/notifications/read")
                .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))))
                .catch(() => {});
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        api.delete(`/api/notifications/${id}`)
            .then(() => setNotifications((prev) => prev.filter((n) => n.id !== id)))
            .catch(() => {});
    };

    const formatTime = (iso) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return "Ahora";
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
        return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Botón campana */}
            <button
                onClick={handleOpen}
                style={{
                    position: "relative",
                    background: "none",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0a0a0a"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e5e5"}
                title="Notificaciones"
            >
                {/* Icono campana SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#404040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>

                {/* Badge de no leídas */}
                {unread > 0 && (
                    <span style={{
                        position: "absolute",
                        top: -4, right: -4,
                        background: "#e11d48",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        width: 16, height: 16,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                    }}>
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Panel desplegable */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 320,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    zIndex: 1000,
                    overflow: "hidden",
                }}>
                    {/* Cabecera */}
                    <div style={{
                        padding: "0.875rem 1rem",
                        borderBottom: "1px solid #f2f2f2",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0a0a0a" }}>
                            Notificaciones
                        </p>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => {
                                    api.put("/api/notifications/read").catch(() => {});
                                    setNotifications([]);
                                }}
                                style={{
                                    fontSize: "0.72rem", color: "#737373",
                                    background: "none", border: "none",
                                    cursor: "pointer", fontWeight: 500,
                                }}
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "2rem 1rem", textAlign: "center" }}>
                                <p style={{ fontSize: "0.85rem", color: "#737373" }}>
                                    No tienes notificaciones
                                </p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        padding: "0.875rem 1rem",
                                        borderBottom: "1px solid #f9f9f9",
                                        background: n.read ? "#fff" : "#fafaf8",
                                        transition: "background 0.15s",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        {/* Punto de no leída */}
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                            {!n.read && (
                                                <span style={{
                                                    width: 6, height: 6, borderRadius: "50%",
                                                    background: "#0a0a0a", flexShrink: 0,
                                                    marginTop: 5,
                                                }} />
                                            )}
                                            <p style={{ fontSize: "0.82rem", color: "#0a0a0a", lineHeight: 1.4 }}>
                                                {n.message}
                                            </p>
                                        </div>
                                        <p style={{ fontSize: "0.72rem", color: "#737373", marginTop: "0.25rem", marginLeft: n.read ? 0 : 14 }}>
                                            {formatTime(n.created_at)}
                                        </p>
                                    </div>
                                    {/* Botón eliminar */}
                                    <button
                                        onClick={(e) => handleDelete(n.id, e)}
                                        style={{
                                            background: "none", border: "none",
                                            cursor: "pointer", color: "#d4d4d4",
                                            fontSize: "1rem", lineHeight: 1,
                                            flexShrink: 0, padding: "0 2px",
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = "#737373"}
                                        onMouseLeave={(e) => e.target.style.color = "#d4d4d4"}
                                        title="Eliminar"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}