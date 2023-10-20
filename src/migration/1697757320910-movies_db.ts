import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class moviesDb1697757320910 implements MigrationInterface {

    private readonly TABLE_NAME = "movies";

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
            name: "name",
            type: "varchar",
            isNullable: false
          },
          {
            name: "slug",
            type: "varchar",
            isNullable: false
          },
          {
            name: "description",
            type: "varchar",
            isNullable: false
          },
          {
            name: "release_date",
            type: "date",
            isNullable: false
          },
          {
            name: "rating",
            type: "integer",
            default: 1
          },
          {
            name: "ticket_price",
            type: "float",
            default: 0
          },
          {
            name: "country",
            type: "varchar"
          },
          {
            name: "photo",
            type: "varchar"
          },
          {
            name: "status_id",
            type: "integer",
            isNullable: false
          },
          {
            name: "reference",
            type: "varchar",
            isUnique: true
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

      /* Create Indexes On Columns That Will Querieed Often */
      await queryRunner.createIndex(this.TABLE_NAME, new TableIndex({
        name: "SFT_MOV",
        columnNames: ["name", "slug", "reference", "status_id"]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropIndex(this.TABLE_NAME, "SFT_MOV");
      await queryRunner.dropTable(this.TABLE_NAME);
    }

}
