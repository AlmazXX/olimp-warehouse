import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./person.entity";

export enum TransactionStatus {
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "person_id" })
  personId: number;

  @Column("decimal")
  amount: number;

  @Column({ type: "enum", enum: TransactionStatus, enumName: "transaction_status" })
  status: TransactionStatus;

  @Column({ type: "text", unique: true })
  key: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Person)
  @JoinColumn({ name: "person_id" })
  person: Person;
}
