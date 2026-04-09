import Icon from "../Icons/Icon";
import { P } from "../Icons/iconPaths";

export default function DocHeader({ analysis }) {
  const { document_title, authors } = analysis;

  if (!document_title) return null;

  return (
    <div
      className="fade-up"
      style={{
        paddingBottom: "1.5rem",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      {/* Label superior */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#a3a3a3",
          marginBottom: "0.75rem",
        }}
      >
        <Icon path={P.conclude} size={11} stroke="#a3a3a3" />
        Análisis completado
      </div>

      {/* Título del documento */}
      <h2
        style={{
          fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
          fontWeight: 800,
          color: "#0a0a0a",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          margin: 0,
          marginBottom: authors?.length ? "0.6rem" : 0,
        }}
      >
        {document_title}
      </h2>

      {/* Autores */}
      {authors && authors.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.82rem",
            color: "#737373",
            fontWeight: 500,
          }}
        >
          <Icon path={P.user} size={13} stroke="#a3a3a3" />
          {authors.join(" · ")}
        </div>
      )}
    </div>
  );
}
