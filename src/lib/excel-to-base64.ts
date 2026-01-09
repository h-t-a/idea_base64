import fs from 'fs';

export function excelToBase64(filePath: string): {
  base64: string;
  dataUrl: string;
} {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');

  const dataUrl =
    `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;

  return { base64, dataUrl };
}
