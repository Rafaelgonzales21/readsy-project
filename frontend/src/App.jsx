import React, { useState, useRef } from "react";
import axios from "axios";

/* ── Inline SVG Icon ─────────────────────────────────────── */
const Icon = ({ path, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(path)
      ? path.map((d, i) => <path key={i} d={d} />)
      : <path d={path} />}
  </svg>
);

/* ── Icon paths ──────────────────────────────────────────── */
const P = {
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  pdf: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"],
  check: ["M20 6 9 17l-5-5"],
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  chevron: "M9 18l6-6-6-6",
  book: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"],
  target: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  bulb: "M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M12 21a6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6 6 6 0 0 1-6 6z",
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  help: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
  conclude: ["M9 12l2 2 4-4", "M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"],
};

/* ── Difficulty badge ────────────────────────────────────── */
const diffBadge = {
  Easy: "badge badge-easy",
  Medium: "badge badge-medium",
  Hard: "badge badge-hard",
};

/* ── Section Component ───────────────────────────────────── */
function Section({ iconPath, title, children, delay = "0" }) {
  return (
    <div className={`card fade-up-${delay}`} style={{ padding: "1.5rem" }}>
      <div className="section-rule">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#171717" }}>
          <Icon path={iconPath} size={15} />
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Sk({ h = "14px", w = "100%", mb = "10px" }) {
  return <div className="shimmer" style={{ height: h, width: w, marginBottom: mb }} />;
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
function App() {
  const [file, setFile] = useState(null);
  const [depth, setDepth] = useState("Detailed (4-6 paragraphs)");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  /* ── API call ─────────────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("depth", String(depth));
    formData.append("questions", String(5));
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await axios.post("http://localhost:8000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  /* ── Drop handler ─────────────────────────────────────── */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="navbar">
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 28, height: 28, background: "#0a0a0a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon path={P.book} size={15} stroke="#ffffff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", color: "#0a0a0a" }}>
              Readsy
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#737373", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Analizador Académico
          </span>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────── */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

        {/* ── Hero ────────────────────────────────────── */}
        <header className="fade-up" style={{ marginBottom: "3.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            border: "1px solid #e5e5e5", borderRadius: 2,
            padding: "0.25rem 0.75rem", marginBottom: "1.5rem",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#737373",
          }}>
            <Icon path={P.zap} size={11} />
            Impulsado por IA · Inteligencia académica
          </div>

          <h1 className="display-font" style={{
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "#0a0a0a",
            marginBottom: "1.2rem",
          }}>
            Entender cualquier<br />
            <span style={{ color: "#737373" }}>documento, al instante.</span>
          </h1>

          <p style={{ fontSize: "1rem", color: "#737373", lineHeight: 1.75, maxWidth: 520, fontWeight: 400 }}>
            Sube cualquier PDF académico y obtén en cuestión de segundos un análisis generado por IA: resúmenes, ideas clave, objetivos, conclusiones y preguntas de examen generadas automáticamente.
          </p>
        </header>

        {/* ── Upload Card ─────────────────────────────── */}
        <div className="card fade-up-1" style={{ padding: "2rem", marginBottom: "1.5rem" }}>

          {/* Drop zone */}
          <div
            className={`upload-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            style={{ padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              id="pdf-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />

            {file ? (
              /* ── File selected state ── */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 44, height: 44, border: "1px solid #e5e5e5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
                  <Icon path={P.pdf} size={20} stroke="#0a0a0a" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.93rem", color: "#0a0a0a", marginBottom: "0.2rem" }}>{file.name}</p>
                  <p style={{ fontSize: "0.78rem", color: "#737373" }}>
                    {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Ready</span>
                    &nbsp;·&nbsp;
                    <span style={{ textDecoration: "underline", cursor: "pointer" }}>change file</span>
                  </p>
                </div>
              </div>
            ) : (
              /* ── Empty state ── */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 48, height: 48, border: "1.5px dashed #d4d4d4", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#a3a3a3" }}>
                  <Icon path={P.upload} size={22} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0a0a0a", marginBottom: "0.25rem" }}>
                    Arrastra el PDF aquí o haz clic para buscarlo
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#a3a3a3" }}>
                    Soporta PDF · Hasta 50 MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>

            {/* Depth */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label htmlFor="depth-select" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a3a3a3", marginBottom: "0.45rem" }}>
                Profundidad del análisis
              </label>
              <select
                id="depth-select"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="select-bw"
              >
                <option value="Short (1 paragraph)">Corto — 1 párrafo </option>
                <option value="Medium (2-3 paragraphs)">Medio — 2–3 párrafos</option>
                <option value="Detailed (4-6 paragraphs)">Detallado — 4–6 párrafos</option>
              </select>
            </div>

            {/* Button */}
            <div style={{ display: "flex", alignItems: "flex-end", flex: 1, minWidth: 160 }}>
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="btn-black"
                style={{ width: "100%", padding: "0.72rem 1.5rem", borderRadius: 4 }}
              >
                {loading ? (
                  <span className="ld">
                    <span /><span /><span />
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

        {/* ── Loading placeholders ─────────────────── */}
        {loading && (
          <div className="card fade-up" style={{ padding: "2rem" }}>
            <Sk h="22px" w="55%" mb="1.5rem" />
            <Sk mb="8px" /><Sk w="88%" mb="8px" /><Sk w="72%" mb="2rem" />
            <Sk h="14px" w="35%" mb="1rem" />
            <Sk mb="6px" /><Sk w="80%" mb="6px" /><Sk w="65%" />
          </div>
        )}

        {/* ── Results ─────────────────────────────── */}
        {analysis && !loading && (
          <div id="results-section">

            {/* ── Title block ── */}
            <div className="fade-up" style={{
              borderLeft: "4px solid #0a0a0a",
              paddingLeft: "1.5rem",
              marginBottom: "1.5rem",
            }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3", marginBottom: "0.5rem" }}>
                Documento Analizado
              </p>
              <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.02em", color: "#0a0a0a", lineHeight: 1.2, marginBottom: "0.6rem" }}>
                {analysis.document_title}
              </h2>
              {analysis.authors?.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#737373" }}>
                  <Icon path={P.user} size={13} />
                  {analysis.authors.join(" · ")}
                </div>
              )}
            </div>

            {/* ── Summary ── */}
            <Section iconPath={P.book} title="Resumen" delay="2">
              <p style={{ fontSize: "0.92rem", color: "#404040", lineHeight: 1.8 }}>{analysis.summary}</p>
            </Section>

            <div style={{ height: "1rem" }} />

            {/* ── 2-col grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>

              <Section iconPath={P.target} title="Objetivos Principales" delay="3">
                {analysis.main_objectives?.map((obj, i) => (
                  <div key={i} className="result-row">
                    <span className="num">{i + 1}</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </Section>

              <Section iconPath={P.bulb} title="Ideas Principales" delay="4">
                {analysis.main_ideas?.map((idea, i) => (
                  <div key={i} className="result-row">
                    <span className="num">{i + 1}</span>
                    <span>{idea}</span>
                  </div>
                ))}
              </Section>
            </div>

            {/* ── Key Points ── */}
            <Section iconPath={P.key} title="Puntos Clave" delay="5">
              <div style={{ columns: "2 280px", columnGap: "1.5rem" }}>
                {analysis.key_points?.map((kp, i) => (
                  <div key={i} className="result-row" style={{ breakInside: "avoid" }}>
                    <span className="num">{i + 1}</span>
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ height: "1rem" }} />

            {/* ── Insights ── */}
            <Section iconPath={P.eye} title="Perspectivas" delay="6">
              {analysis.insights?.map((ins, i) => (
                <div key={i} className="result-row">
                  <span className="num">{i + 1}</span>
                  <span>{ins}</span>
                </div>
              ))}
            </Section>

            <div style={{ height: "1rem" }} />

            {/* ── Conclusions ── */}
            <Section iconPath={P.conclude} title="Conclusions" delay="7">
              <p style={{ fontSize: "0.92rem", color: "#404040", lineHeight: 1.8 }}>{analysis.conclusions}</p>
            </Section>

            <div style={{ height: "1rem" }} />

            {/* ── Questions ── */}
            <Section iconPath={P.help} title="Generated Questions" delay="8">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.25rem" }}>
                {analysis.questions?.map((q, idx) => (
                  <div key={q.number} className="q-card" style={{ animationDelay: `${0.05 * idx}s` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.78rem", color: "#0a0a0a", letterSpacing: "0.04em" }}>
                        Q{q.number}
                      </span>
                      <span className="badge badge-outline">{q.q_type}</span>
                      <span className={diffBadge[q.difficulty] ?? "badge badge-outline"}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, color: "#0a0a0a", marginBottom: "0.5rem", lineHeight: 1.5, fontSize: "0.92rem" }}>
                      {q.question}
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "#737373", lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700, color: "#a3a3a3", marginRight: "0.25rem" }}>Answer:</span>
                      {q.suggested_answer}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
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

export default App;