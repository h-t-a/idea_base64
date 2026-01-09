import { NextRequest, NextResponse } from 'next/server';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { streamToBase64 } from '@/lib/excel-stream-to-base64';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>((resolve, reject) => {
    const headers = Object.fromEntries(req.headers);

    const busboy = Busboy({
      headers,
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    });

    let handled = false;
    let responseFormat: 'base64' | 'dataurl' = 'dataurl';

    busboy.on('field', (name, value) => {
      if (name === 'format' && (value === 'base64' || value === 'dataurl')) {
        responseFormat = value;
      }
    });

    busboy.on('file', async (_field, file, info) => {
      const { filename, mimeType } = info;

      if (!filename || !filename.match(/\.(xls|xlsx)$/i)) {
        reject(
          NextResponse.json(
            { success: false, message: 'Invalid Excel file' },
            { status: 400 }
          )
        );
        return;
      }

      const { base64, dataUrl } = await streamToBase64(file, mimeType);
      handled = true;

      resolve(
        NextResponse.json({
          success: true,
          ...(responseFormat === 'base64'
            ? { base64 }
            : { dataUrl }),
        })
      );
    });

    busboy.on('finish', () => {
      if (!handled) {
        reject(
          NextResponse.json(
            { success: false, message: 'No file uploaded' },
            { status: 400 }
          )
        );
      }
    });

    const nodeStream = Readable.fromWeb(req.body as any);
    nodeStream.pipe(busboy);
  });
}
