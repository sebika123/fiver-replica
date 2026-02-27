// gigs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGigInput, UpdateGigInput } from './dto/gigs.type';
import { GigsUploadService } from './gigs-upload.service';
import { Gig, GigDocument, ImageType } from './schema/gig.schema';

@Injectable()
export class GigsService {
  constructor(
    @InjectModel(Gig.name) private gigModel: Model<GigDocument>,
    private readonly uploadService: GigsUploadService,
  ) {}

  private toGigObject(doc: GigDocument): any {
    const obj = doc.toObject({ virtuals: true });
    obj._id = obj._id.toString();
    obj.id = obj._id;
    return obj;
  }

  async createGig(createGigInput: CreateGigInput, userId: string) {
    let images: ImageType[] = [];

    if (createGigInput.images && createGigInput.images.length > 0) {
      images = await this.uploadService.uploadMultipleImages(
        createGigInput.images,
      );
    }

    const { images: _, ...gigData } = createGigInput;

    const gig = new this.gigModel({
      ...gigData,
      images,
      userId,
    });

    const savedGig = await gig.save();

    return {
      gig: this.toGigObject(savedGig), 
      message: 'Gig created successfully',
    };
  }

  async listAllGigs(userId: string, page = 1, limit = 10): Promise<any[]> {
    const skip = (page - 1) * limit;
    const gigs = await this.gigModel
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .exec();

    return gigs.map((gig) => this.toGigObject(gig)); 
  }

  async editGig(gigId: string, updateData: UpdateGigInput, userId: string) {
    const gig = await this.gigModel.findOne({ _id: gigId, userId });
    if (!gig) {
      throw new Error('Gig not found or unauthorized');
    }

    if (updateData.images && updateData.images.length > 0) {
      const newImages = await this.uploadService.uploadMultipleImages(
        updateData.images,
      );
      gig.images = [...(gig.images || []), ...newImages];
    }

    const { images: _, ...otherData } = updateData;

    const filteredData = Object.fromEntries(
      Object.entries(otherData).filter(([, v]) => v !== undefined),
    );
    Object.assign(gig, filteredData);

    const savedGig = await gig.save();

    return {
      gig: this.toGigObject(savedGig),
      message: 'Gig updated successfully',
    };
  }
  async deleteGig(gigId: string, userId: string) {
    const gig = await this.gigModel.findOne({ _id: gigId, userId });
    if (!gig) {
      throw new Error('Gig not found or unauthorized');
    }

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
    if (!gig) throw new Error('Gig not found');
    return this.toGigObject(gig); 
  }
}
