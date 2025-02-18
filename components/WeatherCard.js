export default function WeatherCard({ title, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}