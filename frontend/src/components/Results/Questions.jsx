import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

const DIFF_STYLES = {
  
  easy:   { background: "#dcfce7", color: "#15803d" },
  medium: { background: "#fef9c3", color: "#a16207" },
  hard:   { background: "#fee2e2", color: "#b91c1c" },
  
  fácil:  { background: "#dcfce7", color: "#15803d" },
  facil:  { background: "#dcfce7", color: "#15803d" },
  medio:  { background: "#fef9c3", color: "#a16207" },
  media:  { background: "#fef9c3", color: "#a16207" },
  difícil:{ background: "#fee2e2", color: "#b91c1c" },
  dificil:{ background: "#fee2e2", color: "#b91c1c" },
  alta:   { background: "#fee2e2", color: "#b91c1c" },
};

function getDiffStyle(difficulty = "") {
  return (
    DIFF_STYLES[difficulty.toLowerCase().trim()] ?? {
      background: "#f5f5f5",
      color: "#737373",
    }
  );
}

export default function Questions({ analysis }) {
  return (
    <Section iconPath={P.help} title="Preguntas Generadas" delay="8">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginTop: "0.25rem",
        }}
      >
        {analysis.questions?.map((q, idx) => (
          <div
            key={q.number ?? idx}
            className="q-card"
            style={{ animationDelay: `${0.05 * idx}s` }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  color: "#0a0a0a",
                  letterSpacing: "0.04em",
                }}
              >
                P{q.number}
              </span>
              <span className="badge badge-outline">{q.q_type}</span>
              {/* Badge de dificultad con color inline garantizado */}
              <span
                style={{
                  ...getDiffStyle(q.difficulty),
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.55rem",
                  borderRadius: 4,
                }}
              >
                {q.difficulty}
              </span>
            </div>

            <p
              style={{
                fontWeight: 600,
                color: "#0a0a0a",
                marginBottom: "0.5rem",
                lineHeight: 1.5,
                fontSize: "0.92rem",
              }}
            >
              {q.question}
            </p>

            <p
              style={{
                fontSize: "0.82rem",
                color: "#737373",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#a3a3a3",
                  marginRight: "0.25rem",
                }}
              >
                Respuesta sugerida:
              </span>
              {q.suggested_answer}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}