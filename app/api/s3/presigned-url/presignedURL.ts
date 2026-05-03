import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from './s3';

const BUCKET_NAME = 'aws-s3-teamspace-990678687582-ap-northeast-2-an';
type CreatePresignedUploadUrlParams = {
  filename: string;
  contentType: string;
};
export async function createPresignedUploadUrl({
  filename,
  contentType,
}: CreatePresignedUploadUrlParams) {
  const key = `uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return {
    uploadUrl,
    key,
  };
}
