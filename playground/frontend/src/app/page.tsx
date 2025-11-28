"use client";

import { useState } from "react";

export default function Home() {
  const [dataInput, setDataInput] = useState("1, 2, 3, 4, 5, 10, 20");
  const [epsilon, setEpsilon] = useState(1.0);
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(20);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const data = dataInput.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));

      const response = await fetch("http://localhost:8000/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          epsilon,
          lower_bound: lowerBound,
          upper_bound: upperBound,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const resData = await response.json();
      setResults(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Differential Privacy Playground
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Data Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dataset (comma separated numbers)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Epsilon (ε)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Lower = More Privacy, Less Accuracy</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lower Bound
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                  value={lowerBound}
                  onChange={(e) => setLowerBound(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upper Bound
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                  value={upperBound}
                  onChange={(e) => setUpperBound(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate DP Statistics"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard title="Count" actual={results.actual_count} dp={results.count} />
            <ResultCard title="Sum" actual={results.actual_sum} dp={results.sum} />
            <ResultCard title="Mean" actual={results.actual_mean} dp={results.mean} />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, actual, dp }: { title: string; actual: number; dp: number }) {
  const diff = Math.abs(actual - dp);
  const percentError = actual !== 0 ? (diff / Math.abs(actual)) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h3>
        <div className="mt-5">
          <div className="flex justify-between items-baseline">
            <div className="text-sm text-gray-500 dark:text-gray-400">Actual</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{actual.toFixed(2)}</div>
          </div>
          <div className="flex justify-between items-baseline mt-2">
            <div className="text-sm text-indigo-500 dark:text-indigo-400">DP (ε)</div>
            <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{dp.toFixed(2)}</div>
          </div>
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Noise: <span className="font-medium text-gray-900 dark:text-white">{diff.toFixed(4)}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Error: <span className="font-medium text-gray-900 dark:text-white">{percentError.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
