import Section from "../Sections/Section";
import { P } from "../Icons/iconPaths";

export default function Objectives({ analysis }) {
  return (
    <Section iconPath={P.target} title="Objetivos Principales" delay="3">
      {analysis.main_objectives?.map((obj, i) => (
        <div key={i} className="result-row">
          <span className="num">{i + 1}</span>
          <span>{obj}</span>
        </div>
      ))}
    </Section>
  );
}