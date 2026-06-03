import { apiClient } from './client';
import { CLOUDINARY_CLOUD_NAME } from '../constants/cloudinary';
import * as FileSystem from 'expo-file-system';

export async function getImageUploadParams() {
  const { data } = await apiClient.post('/api/upload/image');
  return data;
}

export async function getAudioUploadParams() {
  const { data } = await apiClient.post('/api/upload/audio');
  return data;
}

export async function uploadImageToCloudinary(localUri, params, onProgress) {
  return uploadToCloudinary(localUri, params, onProgress, 'image');
}

export async function uploadAudioToCloudinary(localUri, params, onProgress) {
  return uploadToCloudinary(localUri, params, onProgress, 'video'); // Audio uses video resource_type in Cloudinary
}

async function uploadToCloudinary(localUri, params, onProgress, resourceType) {
  const url = `https://api.cloudinary.com/v1_1/${params.cloudName}/${resourceType}/upload`;
  
  const uploadTask = FileSystem.createUploadTask(
    url,
    localUri,
    {
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      parameters: {
        api_key: params.apiKey,
        timestamp: params.timestamp.toString(),
        signature: params.signature,
      },
    },
    (progressData) => {
      if (onProgress) {
        const percent = (progressData.totalBytesSent / progressData.totalBytesExpectedToSend) * 100;
        onProgress(percent);
      }
    }
  );

  const response = await uploadTask.uploadAsync();
  const responseData = JSON.parse(response.body);
  
  if (response.status !== 200) {
    throw new Error(responseData.error?.message || 'Cloudinary upload failed');
  }

  return {
    cloudinaryId: responseData.public_id,
    remoteUrl: responseData.secure_url,
    thumbnailUrl: buildThumbnailUrl(responseData.public_id, 300, 300, 'fill'),
    durationSec: responseData.duration || null,
  };
}

export function buildThumbnailUrl(cloudinaryId, width, height, crop = 'fill') {
  if (!CLOUDINARY_CLOUD_NAME) return '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_auto,f_auto/${cloudinaryId}`;
}
