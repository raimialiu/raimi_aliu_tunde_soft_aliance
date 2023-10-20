import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class moviesGenresPivotDb1697758019074 implements MigrationInterface {

    private readonly TABLE_NAME = "movies_genres_pivot";

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: this.TABLE_NAME,
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid"
          },
          {
            name: "movie_id",
            type: "varchar",
            isNullable: true
          },
          {
            name: "genre_id",
            type: "varchar",
            isNullable: true
          },
          {
            name: "created_at",
            type: "datetime",
            default: "NOW()"
          },
          {
            name: "updated_at",
            type: "datetime",
            default: "NOW()"
          }
        ]
      }));

      await queryRunner.createIndex(this.TABLE_NAME, new TableIndex({
        name: "SFT_MGP",
        columnNames: ["movie_id", "genre_id"]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
