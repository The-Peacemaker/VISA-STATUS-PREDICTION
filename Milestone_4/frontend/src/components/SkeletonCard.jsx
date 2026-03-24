export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`neo-brutal-card p-5 ${className}`}>
      <div className="shimmer-block mb-4 h-4 w-24 rounded" />
      <div className="shimmer-block mb-3 h-8 w-3/4 rounded" />
      <div className="shimmer-block h-3 w-2/3 rounded" />
    </div>
  );
}
