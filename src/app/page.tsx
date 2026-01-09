'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Conversion failed');
      }

      setResult(data.dataUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          Excel to Base64 Converter
        </h1>

        <label
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-blue-500 transition"
        >
          <input
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          />
          <span className="text-gray-600">
            Drag & drop Excel file or click to browse
          </span>
        </label>

        {loading && (
          <div className="text-center text-blue-600 font-medium">
            Converting...
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {result && (
          <div className="space-y-3">
            <textarea
              readOnly
              className="w-full h-32 border rounded-md p-2 text-xs"
              value={result}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Copy Data URL
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
