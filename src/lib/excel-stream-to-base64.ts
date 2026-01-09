import { Buffer } from 'buffer';

export async function streamToBase64(
  stream: NodeJS.ReadableStream,
  mimeType: string
): Promise<{ base64: string }> { //; dataUrl: string
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString('base64');

  return {
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}
