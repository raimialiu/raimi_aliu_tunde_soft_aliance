import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("genres")
export class Genre {

  @PrimaryGeneratedColumn("uuid")
  id?: string

  @Column()
  name: string

  @Column()
  status_id: number

  @CreateDateColumn({ type: "timestamp" })
  created_at?: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date

}