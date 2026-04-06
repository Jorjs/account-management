import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly repository: Repository<Person>,
  ) {}

  async findById(personId: number): Promise<Person | null> {
    return this.repository.findOneBy({ personId });
  }
}
