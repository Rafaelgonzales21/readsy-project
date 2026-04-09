import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function Ideas({ analysis }) {
  return (
    <Section iconPath={P.bulb} title="Ideas Principales" delay="4">
      {analysis.main_ideas?.map((idea, i) => (
        <div key={i} className="result-row">
          <span className="num">{i + 1}</span>
          <span>{idea}</span>
        </div>
      ))}
    </Section>
  );
}