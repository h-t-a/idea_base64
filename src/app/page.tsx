'use client';

import { useEffect, useState } from 'react';

type Format = 'base64' | 'dataurl';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>('dataurl');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const hasResult = result.length > 0;

  async function convert(file: File, format: Format) {
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
      setResult('');
    } finally {
      setIsConverting(false);
    }
  }

  function handleUpload(selectedFile: File) {
    setFile(selectedFile);
    convert(selectedFile, format);
  }

  useEffect(() => {
    if (file) {
      convert(file, format);
    }
  }, [format]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-lg rounded-xl p-6 space-y-6
        bg-white dark:bg-gray-800
        shadow-md dark:shadow-none
        border border-gray-200 dark:border-gray-700">

        <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
          Excel Converter
        </h1>

        {/* Format Selection */}
        <div className="flex justify-center gap-6 text-sm text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={format === 'dataurl'}
              onChange={() => setFormat('dataurl')}
              disabled={isConverting}
            />
            Data URL
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={format === 'base64'}
              onChange={() => setFormat('base64')}
              disabled={isConverting}
            />
            Base64
          </label>
        </div>

        {/* Upload */}
        <label className="
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition
          border-gray-300 dark:border-gray-600
          hover:border-blue-500 dark:hover:border-blue-400
          text-gray-600 dark:text-gray-300
        ">
          <input
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleUpload(e.target.files[0])
            }
          />
          <span className="text-center">
            Drag & drop Excel file or click to browse
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Conversion status (NO BOUNCE) */}
        <div className="text-sm text-gray-500 dark:text-gray-400 min-h-[1rem] text-center">
          {isConverting ? 'Converting… Please wait' : '\u00A0'}
        </div>

        {/* Result */}
        {hasResult && (
          <div className="space-y-2">
            <textarea
              readOnly
              value={result}
              className="
                w-full h-32 resize-none rounded-md p-2 text-xs
                border
                bg-gray-50 dark:bg-gray-900
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none
              "
            />

            <button
              className="
                w-full py-2 rounded-md font-medium transition
                bg-blue-600 hover:bg-blue-700
                text-white
                disabled:opacity-50
              "
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
