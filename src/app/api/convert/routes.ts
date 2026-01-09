import { NextRequest, NextResponse } from 'next/server';
import Busboy from 'busboy';
import { streamToBase64 } from '@/lib/excel-stream-to-base64';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>((resolve, reject) => {
    const busboy = Busboy({
      headers: Object.fromEntries(req.headers),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
    });

    let fileProcessed = false;

    busboy.on('file', async (_name: any, file: NodeJS.ReadableStream, info: { mimeType: any; filename: any; }) => {
      const { mimeType, filename } = info;

      if (!filename.match(/\.(xls|xlsx)$/)) {
        reject(
          NextResponse.json(
            { success: false, message: 'Invalid Excel file format' },
            { status: 400 }
          )
        );
        return;
      }

      const result = await streamToBase64(file, mimeType);
      fileProcessed = true;

      resolve(
        NextResponse.json({
          success: true,
          ...result,
        })
      );
    });

    busboy.on('finish', () => {
      if (!fileProcessed) {
        reject(
          NextResponse.json(
            { success: false, message: 'No file uploaded' },
            { status: 400 }
          )
        );
      }
    });

    req.body?.pipe(busboy);
  });
}
