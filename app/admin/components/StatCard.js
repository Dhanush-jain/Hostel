export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-gray-600">{title}</h3>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
