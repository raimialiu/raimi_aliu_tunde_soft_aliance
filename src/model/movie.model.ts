import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("movies")
export class Movie {

  @PrimaryGeneratedColumn("uuid")
  id?: string

  @Column()
  name: string

  @Column()
  slug: string

  @Column()
  description: string

  @Column()
  release_date: Date

  @Column()
  rating: number

  @Column({ type: "float" })
  ticket_price: number

  @Column()
  country: string

  @Column()
  photo: string

  @Column()
  status_id: number

  @Column()
  reference: string

  @CreateDateColumn({ type: "timestamp" })
  created_at?: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date

}