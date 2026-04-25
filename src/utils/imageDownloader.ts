import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { DownloadErrorCode, DownloadedImage } from '../types';
import { logger } from './logger';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class DownloadError extends Error {
  code: DownloadErrorCode;

  constructor(code: DownloadErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'DownloadError';
  }
}

let cloudinaryConfigured = false;

function normalizeMimeType(value?: string): string {
  switch ((value ?? '').split(';')[0].trim().toLowerCase()) {
    case 'image/jpg':
    case 'image/pjpeg':
      return 'image/jpeg';
    default:
      return (value ?? '').split(';')[0].trim().toLowerCase();
  }
}

function ensureCloudinaryConfigured(): void {
  if (cloudinaryConfigured) {
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  cloudinaryConfigured = true;
}

async function uploadToCloudinary(base64: string, mimeType: DownloadedImage['mimeType']): Promise<string | undefined> {
  try {
    ensureCloudinaryConfigured();
    const uploadResult = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64}`, {
      folder: 'boldmens-whatsapp-ai',
      resource_type: 'image',
    });

    return uploadResult.secure_url;
  } catch (error) {
    logger.warn('Cloudinary upload failed; continuing without persistent image URL', {
      error: error instanceof Error ? error.message : 'Unknown Cloudinary error',
    });
    return undefined;
  }
}

export async function downloadTwilioImage(
  mediaUrl: string,
  hintedMimeType?: string,
): Promise<DownloadedImage> {
  const maxImageBytes = Number(process.env.MAX_IMAGE_SIZE_MB ?? 5) * 1024 * 1024;

  try {
    const response = await axios.get<ArrayBuffer>(mediaUrl, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID ?? '',
        password: process.env.TWILIO_AUTH_TOKEN ?? '',
      },
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const rawContentType = response.headers['content-type'];
    const contentType = normalizeMimeType(
      typeof rawContentType === 'string' && rawContentType ? rawContentType : hintedMimeType,
    );

    if (!allowedMimeTypes.has(contentType)) {
      throw new DownloadError('INVALID_FILE_TYPE', `Unsupported MIME type: ${contentType}`);
    }

    const buffer = Buffer.from(response.data);

    if (buffer.byteLength > maxImageBytes) {
      throw new DownloadError('FILE_TOO_LARGE', `Image exceeds ${maxImageBytes} bytes`);
    }

    const base64 = buffer.toString('base64');
    const cloudinaryUrl = await uploadToCloudinary(base64, contentType as DownloadedImage['mimeType']);

    return {
      base64,
      mimeType: contentType as DownloadedImage['mimeType'],
      cloudinaryUrl,
    };
  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }

    throw new DownloadError('DOWNLOAD_FAILED', error instanceof Error ? error.message : 'Unknown download error');
  }
}
