import { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import api from "../services/api";

// ── Tarjeta de info ────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0.875rem 0", borderBottom: "1px solid #f2f2f2",
        }}>
            <span style={{ fontSize: "0.88rem", color: "#737373", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: "0.88rem", color: "#0a0a0a", fontWeight: 600 }}>{value}</span>
        </div>
    );
}

export default function ProfilePage() {
    const { user, logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Cambio de contraseña
    const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState("");
    const [pwError, setPwError] = useState("");

    useEffect(() => {
        api.get("/api/auth/profile")
            .then((res) => setProfile(res.data))
            .catch(() => {})
            .finally(() => setLoadingProfile(false));
    }, []);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError("");
        setPwSuccess("");

        if (form.new_password !== form.confirm_password) {
            setPwError("Las contraseñas nuevas no coinciden");
            return;
        }
        if (form.new_password.length < 8) {
            setPwError("La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }

        setPwLoading(true);
        try {
            await api.put("/api/auth/change-password", {
                current_password: form.current_password,
                new_password: form.new_password,
            });
            setPwSuccess("Contraseña actualizada correctamente");
            setForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            setPwError(err.response?.data?.detail || "Error al cambiar la contraseña");
        } finally {
            setPwLoading(false);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("es-ES", {
            day: "2-digit", month: "long", year: "numeric",
        });
    };

    const inputStyle = {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        fontSize: "0.95rem",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
    };

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <main style={{ maxWidth: 600, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

                {/* Cabecera */}
                <header className="fade-up" style={{ marginBottom: "2.5rem" }}>
                    <h1 className="display-font" style={{
                        fontSize: "clamp(2rem, 5vw, 3rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        color: "#0a0a0a",
                        marginBottom: "0.5rem",
                    }}>
                        Mi perfil
                    </h1>
                    <p style={{ color: "#737373", fontSize: "1rem" }}>
                        Gestiona tu cuenta y configuración
                    </p>
                </header>

                {/* Información de la cuenta */}
                <div className="card fade-up-1" style={{ padding: "1.5rem 2rem", marginBottom: "1.25rem" }}>
                    <p style={{
                        fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: "#737373", marginBottom: "0.5rem",
                    }}>
                        Información de la cuenta
                    </p>

                    {loadingProfile ? (
                        <p style={{ color: "#737373", fontSize: "0.88rem" }}>Cargando...</p>
                    ) : (
                        <>
                            <InfoRow label="Email" value={profile?.email || user?.email || "—"} />
                            <InfoRow label="Rol" value={profile?.role === "admin" ? "Administrador" : "Usuario"} />
                            <InfoRow label="Miembro desde" value={formatDate(profile?.created_at)} />
                            <InfoRow label="Documentos analizados" value={profile?.total_analyses ?? "—"} />
                        </>
                    )}
                </div>

                {/* Cambiar contraseña */}
                <div className="card" style={{ padding: "1.5rem 2rem", marginBottom: "1.25rem" }}>
                    <p style={{
                        fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: "#737373", marginBottom: "1.25rem",
                    }}>
                        Cambiar contraseña
                    </p>

                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#404040" }}>
                                Contraseña actual
                            </label>
                            <input
                                name="current_password"
                                type="password"
                                value={form.current_password}
                                onChange={handleChange}
                                placeholder="Tu contraseña actual"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#404040" }}>
                                Nueva contraseña
                            </label>
                            <input
                                name="new_password"
                                type="password"
                                value={form.new_password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#404040" }}>
                                Confirmar nueva contraseña
                            </label>
                            <input
                                name="confirm_password"
                                type="password"
                                value={form.confirm_password}
                                onChange={handleChange}
                                placeholder="Repite la nueva contraseña"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#0a0a0a"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                            />
                        </div>

                        {pwError && (
                            <p style={{
                                fontSize: "0.85rem", color: "#e11d48",
                                background: "#fff1f2", padding: "0.75rem",
                                borderRadius: 8, border: "1px solid #fecdd3",
                            }}>
                                {pwError}
                            </p>
                        )}

                        {pwSuccess && (
                            <p style={{
                                fontSize: "0.85rem", color: "#16a34a",
                                background: "#f0fdf4", padding: "0.75rem",
                                borderRadius: 8, border: "1px solid #bbf7d0",
                            }}>
                                {pwSuccess}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn-black"
                            disabled={pwLoading}
                            style={{ padding: "0.75rem", borderRadius: 8, marginTop: "0.25rem" }}
                        >
                            {pwLoading ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                    </form>
                </div>

                {/* Zona de peligro */}
                <div className="card" style={{ padding: "1.5rem 2rem", border: "1px solid #fecdd3" }}>
                    <p style={{
                        fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: "#e11d48", marginBottom: "0.5rem",
                    }}>
                        Cerrar sesión
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#737373", marginBottom: "1rem" }}>
                        Tu sesión se cerrará y serás redirigido al login.
                    </p>
                    <button
                        onClick={logout}
                        style={{
                            padding: "0.65rem 1.25rem", borderRadius: 8,
                            border: "1px solid #fecdd3", background: "transparent",
                            color: "#e11d48", fontWeight: 600, fontSize: "0.88rem",
                            cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.target.style.background = "#fff1f2"; }}
                        onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
                    >
                        Cerrar sesión
                    </button>
                </div>
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