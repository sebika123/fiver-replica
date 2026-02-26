import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GigsService } from './gigs.service';
import {
  CreateGigInput,
  CreateGigResponse,
  ListGigsInput,
  UpdateGigInput,
} from './dto/gigs.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Gig } from './schema/gig.schema';

@Resolver()
export class GigsResolver {
  constructor(private gigsService: GigsService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateGigResponse)
  async createGig(
    @Args('input') createGigInput: CreateGigInput,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    return this.gigsService.createGig(createGigInput, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Gig])
  async listAllGigs(
    @Args('input', { nullable: true }) input: ListGigsInput,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    return this.gigsService.listAllGigs(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateGigResponse)
  async editGig(
    @Args('gigId') gigId: string,
    @Args('updateData') updateData: UpdateGigInput,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    const updatedGig = await this.gigsService.editGig(
      gigId,
      updateData,
      userId,
    );
    return {
      gig: updatedGig,
      message: 'Gig updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => String)
  async deleteGig(@Args('gigId') gigId: string, @Context() ctx) {
    const userId = ctx.req.user.userId;
    const deletedGig = await this.gigsService.deleteGig(gigId, userId);
    return deletedGig.message;
  }
}
