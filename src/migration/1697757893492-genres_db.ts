import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class genresDb1697757893492 implements MigrationInterface {

  private readonly TABLE_NAME = "genres";

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
          isNullable: false,
          isUnique: true
        },
        {
          name: "status_id",
          type: "integer",
          isNullable: false
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
      name: "SFT_GENR",
      columnNames: ["name", "status_id"]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.TABLE_NAME, "SFT_GENR");
    await queryRunner.dropTable(this.TABLE_NAME);
  }

}
