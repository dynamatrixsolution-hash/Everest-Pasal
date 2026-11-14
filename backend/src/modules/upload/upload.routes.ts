import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Helper to process Base64 or binary data
 */
function saveFileFromDataUrl(dataUrl: string, originalName = 'upload'): { fileName: string; url: string; size: number; mimeType: string } {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let mimeType = 'image/png';
  let buffer: Buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // Treat raw base64 or buffer
    buffer = Buffer.from(dataUrl, 'base64');
  }

  // Validate size (max 15MB)
  if (buffer.length > 15 * 1024 * 1024) {
    throw new Error('File exceeds maximum allowable size of 15MB');
  }

  const extMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/csv': '.csv',
    'application/json': '.json',
  };

  const ext = extMap[mimeType] || path.extname(originalName) || '.png';
  const hash = crypto.randomBytes(12).toString('hex');
  const safeName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeName}-${hash}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return {
    fileName,
    url: `/uploads/${fileName}`,
    size: buffer.length,
    mimeType,
  };
}

/**
 * POST /api/v1/upload/image
 * Supports JSON payload with dataUrl or raw base64
 */
router.post('/image', (req: Request, res: Response) => {
  try {
    const { dataUrl, fileData, fileName = 'image.png' } = req.body;
    const raw = dataUrl || fileData;

    if (!raw) {
      res.status(400).json({ success: false, message: 'No image payload provided (expected dataUrl or fileData)' });
      return;
    }

    const saved = saveFileFromDataUrl(raw, fileName);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: saved,
      url: saved.url,
      fileName: saved.fileName,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
  }
});

/**
 * POST /api/v1/upload/document
 */
router.post('/document', (req: Request, res: Response) => {
  try {
    const { dataUrl, fileData, fileName = 'document.pdf' } = req.body;
    const raw = dataUrl || fileData;

    if (!raw) {
      res.status(400).json({ success: false, message: 'No document payload provided' });
      return;
    }

    const saved = saveFileFromDataUrl(raw, fileName);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: saved,
      url: saved.url,
      fileName: saved.fileName,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Document upload failed' });
  }
});

/**
 * GET /api/v1/upload/status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    storage: 'local-persistent',
    uploadDir: UPLOADS_DIR,
    maxSizeMb: 15,
  });
});

export default router;
