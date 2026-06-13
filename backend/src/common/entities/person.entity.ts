import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;
}
