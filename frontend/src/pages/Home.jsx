import { useState, useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import UploadZone from "../components/Upload/UploadZone";
import Results from "../components/Results/Results";
import Skeleton from "../components/Sections/Skeleton";
import { analyzePDF } from "../services/api";
import Icon from "../components/Icons/Icon";
import { P } from "../components/Icons/iconPaths";


export default function Home() {
    const [file, setFile] = useState(null);
    const [depth, setDepth] = useState("Detailed (4-6 paragraphs)");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const depths = [
        {
            id: "Short (1 paragraph)",
            label: "Corto",
            description: "Análisis rápido: Resumen ejecutivo y 5 ideas clave en < 10 segundos."
        },
        {
            id: "Medium (2-3 paragraphs)",
            label: "Medio",
            description: "Análisis equilibrado: Resumen detallado, ideas clave y objetivos de aprendizaje."
        },
        {
            id: "Detailed (4-6 paragraphs)",
            label: "Detallado",
            description: "Análisis exhaustivo: Todo el contenido anterior más preguntas de examen y conclusiones profundas."
        }
    ];

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === "application/pdf") setFile(f);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setAnalysis(null);
        try {
            const res = await analyzePDF(file, depth);
            setAnalysis(res.data);
        } catch (err) {
            console.error("Error:", err);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Navbar />
            <div style={{ display: "flex" }}>
            <main
                style={{
                    maxWidth: 860,
                    margin: "0 auto",
                    padding: "4rem 1.5rem 6rem",
                }}
            >
                {/* Hero */}
                <header className="fade-up" style={{ marginBottom: "3.5rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            border: "1px solid #e5e5e5",
                            borderRadius: 2,
                            padding: "0.25rem 0.75rem",
                            marginBottom: "1.5rem",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#737373",
                        }}
                    >
                        <Icon path={P.zap} size={11} />
                        Impulsado por IA · Inteligencia académica
                    </div>

                    <h1
                        className="display-font"
                        style={{
                            fontSize: "clamp(2.8rem, 7vw, 5rem)",
                            fontWeight: 900,
                            lineHeight: 1.0,
                            letterSpacing: "-0.03em",
                            color: "#0a0a0a",
                            marginBottom: "1.2rem",
                        }}
                    >
                        Entender cualquier
                        <br />
                        <span style={{ color: "#737373" }}>
                            documento, al instante.
                        </span>
                    </h1>

                    <p
                        style={{
                            fontSize: "105%",
                            color: "#737373",
                            lineHeight: 1.75,
                            maxWidth: 520,
                            fontWeight: 400,
                        }}
                    >
                        Sube cualquier PDF académico y obtén en cuestión de segundos un
                        análisis generado por IA: resúmenes, ideas clave, objetivos,
                        conclusiones y preguntas de examen generadas automáticamente.
                    </p>
                </header>

                {/* Upload Card */}
                <div
                    className="card fade-up-1"
                    style={{ padding: "2.5rem", marginBottom: "2rem" }}
                >
                    <UploadZone
                        file={file}
                        setFile={setFile}
                        dragging={dragging}
                        setDragging={setDragging}
                        handleDrop={handleDrop}
                        inputRef={inputRef}
                    />

                    {/* Depth Selection Control */}
                    <div className="depth-container">
                        <label className="depth-label">
                            Profundidad del Procesamiento
                        </label>
                        <div className="depth-selector">
                            {depths.map((d) => (
                                <button
                                    key={d.id}
                                    className={`depth-option ${depth === d.id ? "active" : ""}`}
                                    onClick={() => setDepth(d.id)}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                        <p className="depth-description">
                            {depths.find(d => d.id === depth)?.description}
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        id="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading || !file}
                        className="btn-black"
                        style={{
                            width: "100%",
                            padding: "0.85rem 1.5rem",
                            borderRadius: 6,
                            marginTop: "1.5rem"
                        }}
                    >
                        {loading ? (
                            <span className="ld">
                                <span />
                                <span />
                                <span />
                            </span>
                        ) : (
                            <>
                                <Icon path={P.zap} size={14} stroke="#ffffff" />
                                Analizar Documento
                            </>
                        )}
                    </button>
                </div>


                {/* Loading */}
                {loading && (
                    <div className="card fade-up" style={{ padding: "2rem" }}>
                        <Skeleton h="22px" w="55%" mb="1.5rem" />
                        <Skeleton mb="8px" />
                        <Skeleton w="88%" mb="8px" />
                        <Skeleton w="72%" mb="2rem" />
                        <Skeleton h="14px" w="35%" mb="1rem" />
                        <Skeleton mb="6px" />
                        <Skeleton w="80%" mb="6px" />
                        <Skeleton w="65%" />
                    </div>
                )}

                {/* Results */}
                {analysis && !loading && <Results analysis={analysis} />}
            </main>
            </div>
            <footer
                style={{
                    borderTop: "1px solid #f2f2f2",
                    padding: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "#d4d4d4",
                    letterSpacing: "0.04em",
                }}
            >
                READSY - ANALIZADOR ACADÉMICO CON IA
            </footer>
        </div>
    );
}