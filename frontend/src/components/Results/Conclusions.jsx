import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function Conclusions({ analysis }) {
  return (
    <Section iconPath={P.conclude} title="Conclusiones" delay="7">
      <p style={{ fontSize: "0.92rem", color: "#404040", lineHeight: 1.8 }}>
        {analysis.conclusions}
      </p>
    </Section>
  );
}