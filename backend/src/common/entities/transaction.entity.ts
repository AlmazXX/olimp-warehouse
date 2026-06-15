import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bank } from "./bank.entity";
import { Person } from "./person.entity";
import { TransactionStatus } from "@olipm/contracts";

@Entity({ name: "transactions" })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "person_id", nullable: true })
  personId: number | null;

  @Column({ name: "bank_id", nullable: true })
  bankId: number | null;

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

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: "person_id" })
  person: Person | null;

  @ManyToOne(() => Bank, { nullable: true })
  @JoinColumn({ name: "bank_id" })
  bank: Bank | null;
}
