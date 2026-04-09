import Summary from "./Summary";
import Objectives from "./Objectives";
import Ideas from "./Ideas";
import KeyPoints from "./KeyPoints";
import Insights from "./Insights";
import Conclusions from "./Conclusions";
import Questions from "./Questions";
import DocHeader from "./DocHeader";

export default function Results({ analysis }) {
  return (
    <div
      id="results-section"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}
    >
      <DocHeader analysis={analysis} />
      <Summary analysis={analysis} />
      <Objectives analysis={analysis} />
      <Ideas analysis={analysis} />
      <KeyPoints analysis={analysis} />
      <Insights analysis={analysis} />
      <Conclusions analysis={analysis} />
      <Questions analysis={analysis} />
    </div>
  );
}