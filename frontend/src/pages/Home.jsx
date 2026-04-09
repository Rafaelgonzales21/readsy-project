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
              fontSize: "1rem",
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
          style={{ padding: "2rem", marginBottom: "1.5rem" }}
        >
          <UploadZone
            file={file}
            setFile={setFile}
            dragging={dragging}
            setDragging={setDragging}
            handleDrop={handleDrop}
            inputRef={inputRef}
          />

          {/* Controls */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label
                htmlFor="depth-select"
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#a3a3a3",
                  marginBottom: "0.45rem",
                }}
              >
                Profundidad del análisis
              </label>
              <select
                id="depth-select"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="select-bw"
              >
                <option value="Short (1 paragraph)">
                  Corto - 1 párrafo
                </option>
                <option value="Medium (2-3 paragraphs)">
                  Medio - 2-3 párrafos
                </option>
                <option value="Detailed (4-6 paragraphs)">
                  Detallado - 4-6 párrafos
                </option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                flex: 1,
                minWidth: 160,
              }}
            >
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="btn-black"
                style={{
                  width: "100%",
                  padding: "0.72rem 1.5rem",
                  borderRadius: 4,
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
          </div>
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