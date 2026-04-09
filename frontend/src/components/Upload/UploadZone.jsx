import Icon from "../Icons/Icon";
import { P } from "../Icons/iconPaths";
import FileInfo from "./FileInfo";

export default function UploadZone({ file, setFile, dragging, setDragging, handleDrop, inputRef }) {
  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
      style={{ padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id="pdf-input"
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "none" }}
      />

      {file ? (
        <FileInfo file={file} />
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: "1.5px dashed #d4d4d4",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a3a3a3"
          }}>
            <Icon path={P.upload} size={22} />
          </div>

          <div>
            <p style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#0a0a0a",
              marginBottom: "0.25rem"
            }}>
              Arrastra el PDF aquí o haz clic para buscarlo
            </p>
            <p style={{ fontSize: "0.78rem", color: "#a3a3a3" }}>
              Soporta PDF · Hasta 50 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}