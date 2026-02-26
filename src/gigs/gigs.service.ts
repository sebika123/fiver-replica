// src/gigs/gigs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGigInput } from './dto/gigs.type';
import { GigsUploadService } from './gigs-upload.service';
import { Gig, ImageType } from './schema/gig.schema';

@Injectable()
export class GigsService {
  constructor(
    @InjectModel(Gig.name) private gigModel: Model<Gig>,
    private readonly uploadService: GigsUploadService,
  ) {}

  async createGig(createGigInput: CreateGigInput, userId: string) {
    // Explicitly type the images array as ImageType[]
    let images: ImageType[] = [];

    if (createGigInput.images && createGigInput.images.length > 0) {
      images = await this.uploadService.uploadMultipleImages(
        createGigInput.images,
      );
    }

    // Remove images from input to avoid storing file promises
    const { images: _, ...gigData } = createGigInput;

    const gig = new this.gigModel({
      ...gigData,
      images, // Now TypeScript knows this is ImageType[]
      userId,
    });

    const savedGig = await gig.save();

    // Convert for GraphQL response
    const responseGig = savedGig.toObject();
    responseGig.id = responseGig._id.toString();

    return {
      gig: responseGig,
      message: 'Gig created successfully',
    };
  }

  async listAllGigs(userId: string, page = 1, limit = 10): Promise<Gig[]> {
    const skip = (page - 1) * limit;
    const gigs = await this.gigModel
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .exec();

    // Convert MongoDB _id to id for GraphQL
    return gigs.map((gig) => {
      const gigObj = gig.toObject();
      gigObj.id = gigObj._id.toString();
      return gigObj;
    });
  }

  async editGig(
    gigId: string,
    updateData: Partial<CreateGigInput>,
    userId: string,
  ) {
    const gig = await this.gigModel.findOne({ _id: gigId, userId });
    if (!gig) {
      throw new Error('Gig not found or unauthorized');
    }

    // Handle new image uploads if present
    if (updateData.images && updateData.images.length > 0) {
      const newImages = await this.uploadService.uploadMultipleImages(
        updateData.images,
      );
      // Append new images to existing ones
      gig.images = [...(gig.images || []), ...newImages];
    }

    // Update other fields
    const { images: _, ...otherData } = updateData;
    Object.assign(gig, otherData);

    const savedGig = await gig.save();

    // Convert for GraphQL response
    const responseGig = savedGig.toObject();
    responseGig.id = responseGig._id.toString();

    return {
      gig: responseGig,
      message: 'Gig updated successfully',
    };
  }

  async deleteGig(gigId: string, userId: string) {
    const gig = await this.gigModel.findOne({ _id: gigId, userId });
    if (!gig) {
      throw new Error('Gig not found or unauthorized');
    }

    // Delete images from Cloudinary
    if (gig.images && gig.images.length > 0) {
      const publicIds = gig.images.map((img) => img.publicId);
      await this.uploadService.deleteMultipleImages(publicIds).catch((err) => {
        console.error('Failed to delete images from Cloudinary:', err);
      });
    }

    await gig.deleteOne();
    return { message: 'Gig deleted successfully' };
  }

  async findOne(gigId: string, userId: string) {
    const gig = await this.gigModel.findOne({ _id: gigId, userId });
    if (!gig) {
      throw new Error('Gig not found');
    }

    const gigObj = gig.toObject();
    gigObj.id = gigObj._id.toString();
    return gigObj;
  }
}
