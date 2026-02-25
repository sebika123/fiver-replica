import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGigInput } from './dto/gigs.type';
import { Gig } from './schema/gig.schema';

@Injectable()
export class GigsService {
  constructor(@InjectModel(Gig.name) private gigModel: Model<Gig>) {}

  async createGig(createGigInput: CreateGigInput) {
    const gig = new this.gigModel(createGigInput);
    const savedGig = await gig.save();
    return {
      gig: savedGig,
      message: 'Gig created successfully',
    };
  }
}
