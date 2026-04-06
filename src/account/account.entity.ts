import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Person } from '../person/person.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'person_id' })
  personId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({
    name: 'daily_withdrawal_limit',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  dailyWithdrawalLimit: number;

  @Column({ name: 'active_flag', type: 'boolean', default: true })
  activeFlag: boolean;

  @Column({ name: 'account_type', type: 'int' })
  accountType: number;

  @CreateDateColumn({ name: 'create_date' })
  createDate: Date;

  @ManyToOne(() => Person, (person) => person.accounts)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
