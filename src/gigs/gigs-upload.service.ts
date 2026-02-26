import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { FileUpload } from 'graphql-upload';
import { ImageType } from './schema/gig.schema';

@Injectable()
export class GigsUploadService {
  constructor(@Inject('CLOUDINARY') private cloudinaryConfig) {}

  async uploadImage(file: Promise<FileUpload>): Promise<ImageType> {
    try {
      const { createReadStream, filename, mimetype } = await file;

      // Validate file type
      if (!mimetype.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const stream = createReadStream();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gig-images',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Failed to upload image: ${error.message}`));
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(
                new Error('Upload failed: No result returned from Cloudinary'),
              );
            }
          },
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Promise<FileUpload>[],
  ): Promise<ImageType[]> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new Error(`Failed to delete image: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    const deletePromises = publicIds.map((id) => this.deleteImage(id));
    await Promise.all(deletePromises);
  }
}
