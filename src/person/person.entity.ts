import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Account } from '../account/account.entity';

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn({ name: 'person_id' })
  personId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  document: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @OneToMany(() => Account, (account) => account.person)
  accounts: Account[];
}
