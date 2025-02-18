import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TemperatureChart({ data }) {
  const chartData = data.map((item, index) => ({
    time: `${item.datetime.slice(8, 10)}:00`,
    value: item.value
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis unit="℃" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}