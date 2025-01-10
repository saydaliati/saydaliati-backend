import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Multer } from 'multer';
import { v4 as uuid } from 'uuid';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}
@Injectable()
export class S3Service {
  private readonly client: S3;

  constructor() {
    this.client = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadAvatar(file: MulterFile): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const key = `avatars/${uuid()}-${file.originalname}`;

    const uploadResults = await this.client.upload({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    return uploadResults.Location;
  }
}
