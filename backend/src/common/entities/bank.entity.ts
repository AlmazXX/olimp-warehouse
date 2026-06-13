import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "banks" })
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
