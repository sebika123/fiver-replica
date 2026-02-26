import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGigInput } from './dto/gigs.type';
import { Gig } from './schema/gig.schema';

@Injectable()
export class GigsService {
  constructor(@InjectModel(Gig.name) private gigModel: Model<Gig>) {}

  async createGig(createGigInput: CreateGigInput, userId: string) {
    const gig = new this.gigModel({ ...createGigInput, userId });
    const savedGig = await gig.save();
    return {
      gig: savedGig,
      message: 'Gig created successfully',
    };
  }
  async listAllGigs(userId: string, page = 1, limit = 10): Promise<Gig[]> {
    const skip = (page - 1) * limit;
    return this.gigModel.find({ userId }).skip(skip).limit(limit).exec();
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
    Object.assign(gig, updateData);
    return gig.save();
  }

  async deleteGig(gigId: string, userId: string) {
    const result = await this.gigModel.deleteOne({ _id: gigId, userId });
    if (result.deletedCount === 0) {
      throw new Error('Gig not found or unauthorized');
    }
    return { message: 'Gig deleted successfully' };
  }
}
