import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GigsService } from './gigs.service';
import { GigsController } from './gigs.controller';
import { Gig, GigSchema } from './schema/gig.schema';
import { GigsResolver } from './gigs.resolver';

@Module({
  imports: [MongooseModule.forFeature([{ name: Gig.name, schema: GigSchema }])],
  providers: [GigsService, GigsResolver],
  controllers: [GigsController],
  exports: [GigsService],
})
export class GigsModule {}
