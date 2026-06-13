import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("decimal")
  balance: number;
}
