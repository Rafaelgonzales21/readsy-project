import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [depth, setDepth] = useState("Detailed (4-6 paragraphs)");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("depth", String(depth));
    formData.append("questions", String(5));

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysis(res.data);
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Academic Analyzer
        </h1>

        {/* File Upload */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"
        />

        {/* Depth Selector */}
        <select
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"
        >
          <option>Short (1 paragraph)</option>
          <option>Medium (2-3 paragraphs)</option>
          <option>Detailed (4-6 paragraphs)</option>
        </select>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* RESULTS */}
      {analysis && (
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8 mt-10 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {analysis.document_title}
          </h2>

          {/* SUMMARY */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Summary</h3>
            <p className="text-gray-600 mt-2">{analysis.summary}</p>
          </section>

          {/* MAIN OBJECTIVES */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Main Objectives</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              {analysis.main_objectives?.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </section>

          {/* MAIN IDEAS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Main Ideas</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              {analysis.main_ideas?.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </section>

          {/* KEY POINTS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Key Points</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              {analysis.key_points?.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          </section>

          {/* INSIGHTS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Insights</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              {analysis.insights?.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </section>

          {/* CONCLUSIONS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Conclusions</h3>
            <p className="text-gray-600 mt-2">{analysis.conclusions}</p>
          </section>

          {/* AUTHORS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Authors</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              {analysis.authors?.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>

          {/* QUESTIONS */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700">Generated Questions</h3>
            <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-3">
              {analysis.questions?.map((q) => (
                <li key={q.number}>
                  <strong className="text-gray-800">{q.number}. {q.question}</strong>
                  <br />
                  <span className="text-sm text-gray-500">
                    Type: {q.q_type} — Difficulty: {q.difficulty}
                  </span>
                  <br />
                  <em className="text-gray-600">
                    Suggested answer: {q.suggested_answer}
                  </em>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;