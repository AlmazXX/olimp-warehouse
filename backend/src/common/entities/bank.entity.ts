import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "banks" })
@Check("balance >= 0")
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "numeric",
    precision: 15,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  balance: number;
}
