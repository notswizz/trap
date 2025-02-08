import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadImageToS3(imageBuffer, filename) {
  try {
    // Convert base64 to buffer if needed
    const buffer = imageBuffer instanceof Buffer 
      ? imageBuffer 
      : Buffer.from(imageBuffer.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `generated-images/${filename}`,
      Body: buffer,
      ContentType: 'image/png'
    };

    await s3Client.send(new PutObjectCommand(params));

    // Return the public URL
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/generated-images/${filename}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
} 