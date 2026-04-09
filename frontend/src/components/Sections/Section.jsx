import Icon from "../Icons/Icon";

export default function Section({ iconPath, title, children, delay = "0" }) {
  return (
    <div className={`card fade-up-${delay}`} style={{ padding: "1.5rem" }}>
      <div className="section-rule">
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: 700,
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#171717"
        }}>
          <Icon path={iconPath} size={15} />
          {title}
        </span>
      </div>

      {children}
    </div>
  );
}