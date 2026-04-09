import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function KeyPoints({ analysis }) {
  return (
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
  );
}