import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './person.entity';
import { PersonRepository } from './person.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  providers: [PersonRepository],
  exports: [PersonRepository],
})
export class PersonModule {}
