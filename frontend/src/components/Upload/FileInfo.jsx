import Icon from "../Icons/Icon";
import { P } from "../Icons/iconPaths";

export default function FileInfo({ file }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.6rem"
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: "1px solid #e5e5e5",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9f9"
      }}>
        <Icon path={P.pdf} size={20} stroke="#0a0a0a" />
      </div>

      <div>
        <p style={{
          fontWeight: 700,
          fontSize: "0.93rem",
          color: "#0a0a0a",
          marginBottom: "0.2rem"
        }}>
          {file.name}
        </p>

        <p style={{ fontSize: "0.78rem", color: "#737373" }}>
          {(file.size / 1024).toFixed(1)} KB &nbsp;
          <span style={{ color: "#16a34a", fontWeight: 600 }}>/ Listo</span>
        </p>
      </div>
    </div>
  );
}