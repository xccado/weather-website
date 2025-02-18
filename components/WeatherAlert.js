import { ExclamationIcon } from '@heroicons/react/solid';

export default function WeatherAlert({ alerts }) {
  return alerts ? (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <ExclamationIcon className="w-5 h-5 text-red-600" />
        <div>
          <h3 className="font-semibold text-red-800">天气预警</h3>
          <p className="text-red-700">{alerts.content}</p>
          <p className="text-sm text-red-600 mt-2">
            发布日期：{alerts.pubtimestamp}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      当前无天气预警
    </div>
  );
}