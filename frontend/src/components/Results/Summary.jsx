import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function Summary({ analysis }) {
  return (
    <Section iconPath={P.book} title="Resumen" delay="2">
      <p style={{ fontSize: "0.92rem", color: "#404040", lineHeight: 1.8 }}>
        {analysis.summary}
      </p>
    </Section>
  );
}