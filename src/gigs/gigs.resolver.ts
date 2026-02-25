import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GigsService } from './gigs.service';
import { CreateGigInput, CreateGigResponse } from './dto/gigs.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver()
export class GigsResolver {
  constructor(private gigsService: GigsService) {}
  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateGigResponse)
  async createGig(@Args('input') createGigInput: CreateGigInput) {
    return this.gigsService.createGig(createGigInput);
  }
}
