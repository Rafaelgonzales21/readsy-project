import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function Insights({ analysis }) {
  return (
    <Section iconPath={P.eye} title="Perspectivas" delay="6">
      {analysis.insights?.map((ins, i) => (
        <div key={i} className="result-row">
          <span className="num">{i + 1}</span>
          <span>{ins}</span>
        </div>
      ))}
    </Section>
  );
}