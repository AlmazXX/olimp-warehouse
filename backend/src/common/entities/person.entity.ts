import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "persons" })
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;
}
