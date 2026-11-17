import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardType } from './card-type.entity';
import { CardTypesService } from './card-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardType])],
  providers: [CardTypesService],
  exports: [CardTypesService],
})
export class CardTypesModule {}
