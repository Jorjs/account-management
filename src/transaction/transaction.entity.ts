import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Account } from '../account/account.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @CreateDateColumn({ name: 'transaction_date' })
  transactionDate: Date;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
