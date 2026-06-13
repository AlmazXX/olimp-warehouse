import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";
import { Bank } from "./bank.entity";

export enum TransactionStatus {
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity({ name: "transactions" })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "person_id" })
  personId: number;

  @Column({ name: "bank_id" })
  bankId: number;

  @Column({
    type: "numeric",
    precision: 15,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  amount: number;

  @Column({ type: "enum", enum: TransactionStatus, enumName: "transaction_status" })
  status: TransactionStatus;

  @Column({ type: "text", unique: true })
  key: string;

  @Column({ type: "text", nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Person)
  @JoinColumn({ name: "person_id" })
  person: Person;

  @ManyToOne(() => Bank)
  @JoinColumn({ name: "bank_id" })
  bank: Bank;
}
