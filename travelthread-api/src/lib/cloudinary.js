import crypto from 'crypto';

const apiSecret = process.env.CLOUDINARY_API_SECRET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

export function getSignedUploadParams(folder) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder
  };
}
