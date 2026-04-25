import { v2 as cloudinary } from 'cloudinary';
import { env, requireConfig } from '../config/env.js';

let configured = false;

function configureCloudinary() {
  if (configured) {
    return;
  }

  cloudinary.config({
    cloud_name: requireConfig('cloudinaryCloudName', env.cloudinaryCloudName),
    api_key: requireConfig('cloudinaryApiKey', env.cloudinaryApiKey),
    api_secret: requireConfig('cloudinaryApiSecret', env.cloudinaryApiSecret),
    secure: true,
  });

  configured = true;
}

export async function uploadAnalysisImage(params: {
  buffer: Buffer;
  mimetype: string;
  userId: string;
}) {
  configureCloudinary();

  const base64 = params.buffer.toString('base64');
  const dataUri = `data:${params.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `boldmens-ai/analysis/${params.userId}`,
    resource_type: 'image',
    overwrite: false,
    tags: ['boldmens-ai', 'selfie', 'delete-after-24h'],
    context: {
      source: 'ios-app',
      delete_after_hours: '24',
    },
  });

  return result.secure_url;
}
