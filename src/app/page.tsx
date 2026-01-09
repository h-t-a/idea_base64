'use client';

import { useEffect, useRef, useState } from 'react';

type Format = 'base64' | 'dataurl';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>('dataurl');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const hasResult = result.length > 0;

  async function convert(file: File, format: Format, silent = false) {
    setError(null);
    setIsConverting(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Conversion failed');
      }

      setResult(format === 'base64' ? data.base64 : data.dataUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  }

  function handleUpload(selectedFile: File) {
    setFile(selectedFile);
    convert(selectedFile, format);
  }

  // Quiet background conversion on format switch
  useEffect(() => {
    if (file) {
      convert(file, format, true);
    }
  }, [format]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          Excel Converter
        </h1>

        {/* Format Selection */}
        <div className="flex justify-center gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={format === 'dataurl'}
              onChange={() => setFormat('dataurl')}
            />
            Data URL
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={format === 'base64'}
              onChange={() => setFormat('base64')}
            />
            Base64
          </label>
        </div>

        {/* Upload */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleUpload(e.target.files[0])
            }
          />
          <span className="text-gray-600 text-center">
            Drag & drop Excel file or click to browse
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {/* Result Area (NEVER UNMOUNTS AFTER FIRST USE) */}
        {hasResult && (
          <div className="relative space-y-2">
            <textarea
              readOnly
              className="w-full h-32 border rounded-md p-2 text-xs resize-none"
              value={result}
            />

            {/* Subtle inline indicator */}
            {/* {isConverting && (
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                Updating…
              </div>
            )} */}

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Copy {format === 'base64' ? 'Base64' : 'Data URL'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
