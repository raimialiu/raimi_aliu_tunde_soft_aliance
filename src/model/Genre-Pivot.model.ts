import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("movies_genres_pivot")
export class MovieGenrePivot {

  @PrimaryGeneratedColumn("uuid")
  id?: string

  @Column()
  movie_id: string

  @Column()
  genre_id: string

  @CreateDateColumn({ type: "timestamp" })
  created_at?: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at?: Date

}