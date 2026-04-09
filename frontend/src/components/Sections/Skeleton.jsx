export default function Skeleton({ h = "14px", w = "100%", mb = "10px" }) {
  return (
    <div className="shimmer" style={{ height: h, width: w, marginBottom: mb }} />
  );
}