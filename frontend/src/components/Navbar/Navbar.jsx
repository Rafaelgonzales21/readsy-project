import Icon from "../Icons/Icon"
import { P } from "../Icons/iconPaths"

export default function Navbar() {
  return (
    <nav className="navbar">
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 1.5rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 28,
            height: 28,
            background: "#0a0a0a",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon path={P.book} size={15} stroke="#fff" />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "-0.02em",
            color: "#0a0a0a"
          }}>
            Readsy
          </span>
        </div>

        <span style={{
          fontSize: "0.75rem",
          color: "#737373",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase"
        }}>
          Analizador Académico
        </span>
      </div>
    </nav>
  );
}