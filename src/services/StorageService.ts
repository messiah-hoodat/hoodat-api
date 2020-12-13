import Boom from '@hapi/boom';
import { S3 } from 'aws-sdk';

import { AddContactImage } from '../controllers/ListController';

const { AWS_S3_BUCKET_NAME } = process.env;

const EXTENSION_TO_MIME_TYPE_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

class StorageService {
  public s3: S3;

  constructor() {
    this.s3 = new S3({
      region: 'us-east-2',
    });
  }

  public async uploadContactImage(
    image: AddContactImage,
    contactId: string
  ): Promise<string> {
    const contentType = this.getContentType(image.name);
    if (!contentType) {
      throw Boom.badRequest(
        `Unsupported file extension. Please use one of ${Object.keys(
          EXTENSION_TO_MIME_TYPE_MAP
        ).join(', ')}`
      );
    }

    const params: AWS.S3.PutObjectRequest = {
      ACL: 'public-read',
      Body: Buffer.from(image.data, 'base64'),
      ContentEncoding: 'base64',
      ContentType: contentType,
      Bucket: AWS_S3_BUCKET_NAME,
      Key: `contact_images/${contactId}.${this.getExtension(image.name)}`,
    };

    let data;
    try {
      data = await this.s3.upload(params).promise();
    } catch (err) {
      throw Boom.internal('Error uploading file: ', err);
    }

    return data.Location;
  }

  public async deleteFile(url: string): Promise<void> {
    let key;
    try {
      key = new URL(url).pathname.substring(1);
    } catch {
      throw new Error('Invalid URL');
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw Boom.internal('Error deleting file: ', err);
    }
  }

  private getContentType(fileName: string): string | null {
    const ext = this.getExtension(fileName);

    return EXTENSION_TO_MIME_TYPE_MAP[ext] ?? null;
  }

  private getExtension(fileName: string): string {
    return fileName.split('.').pop().toLowerCase();
  }
}

export default new StorageService();
