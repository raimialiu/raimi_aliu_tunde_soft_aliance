import { DataSource, DeepPartial, EntityTarget, FindManyOptions, FindOneOptions, QueryRunner } from 'typeorm';
import { AppDataSource as MysqlDataSource } from '../../data-source';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ReadStream } from 'typeorm/platform/PlatformTools';

export class DataAccessService {

  private QueryRunner: QueryRunner = null;

  constructor() {
    this.QueryRunner = null;
  }

  async findOne<T>(model: EntityTarget<T>, options: FindOneOptions<T>): Promise<T>
  async findOne<T>(model: EntityTarget<T>, options: FindOneOptions<T>, dataSource: DataSource): Promise<T>
  async findOne<T>(model: EntityTarget<T>, options: FindOneOptions<T>, dataSource?: DataSource): Promise<T> {
    dataSource = dataSource || MysqlDataSource

    return await dataSource.manager.findOne(model, options);
  }

  async findMany<T>(model: EntityTarget<T>, options: FindManyOptions<T>): Promise<T[]>
  async findMany<T>(model: EntityTarget<T>, options: FindManyOptions<T>, dataSource: DataSource): Promise<T[]>
  async findMany<T>(model: EntityTarget<T>, options: FindManyOptions<T>, dataSource?: DataSource): Promise<T[]> {
    dataSource = dataSource || MysqlDataSource

    return await dataSource.manager.find(model, options);
  }

  getEntityRepo<T>(targetEntity: EntityTarget<T>,
    dataSource?: DataSource) {
    dataSource = dataSource || MysqlDataSource

    return dataSource.getRepository(targetEntity)
  }

  async bulkInsert<T>(model: EntityTarget<T>, data: QueryDeepPartialEntity<T>[]): Promise<void>;
  async bulkInsert<T>(model: EntityTarget<T>, data: QueryDeepPartialEntity<T>[], dataSource: DataSource): Promise<void>;
  async bulkInsert<T>(model: EntityTarget<T>, data: QueryDeepPartialEntity<T>[], dataSource: DataSource, t: boolean): Promise<void>;
  async bulkInsert<T>(model: EntityTarget<T>, data: QueryDeepPartialEntity<T>[], dataSource: DataSource, t?: boolean): Promise<void>;
  async bulkInsert<T>(model: EntityTarget<T>, data: QueryDeepPartialEntity<T>[], dataSource?: DataSource, t?: unknown): Promise<void> {
    dataSource = dataSource || MysqlDataSource

    if (!t) {
      await dataSource.manager
        .createQueryBuilder()
        .insert()
        .into(model)
        .values(data)
        .execute();

      return;
    }

    // Use DB Transactions...
    await this.QueryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(model)
      .values(data)
      .execute();
    return;
  }

  async upsert(entities: unknown[]): Promise<unknown[]> {
    let tasks: unknown[] = []
    entities.forEach((item) => {
      tasks.push(
        this.create(typeof item, item)
          .catch(console.log)
      )
    })

    return await Promise.all(tasks)
  }

  async executeInTransaction<T>(save: any[], updates?: any[], deleteEntites?: any[], queries?: string[]): Promise<{ status: boolean, message?: string, data?: unknown }> {

    const queryRunner = MysqlDataSource.createQueryRunner();
    await queryRunner.connect()

    await queryRunner.startTransaction()

    try {

      let saveResult
      let updateResults: unknown[] = []
      let removeResults;
      let queryResults: unknown[] = []

      if (save.length > 0) {
        saveResult = await queryRunner.manager.save(save)
      }

      if (updates && updates.length > 0) {
        let updateTask: unknown[] = []

        updates.forEach((item) => {
          const { target, where, data } = item;

          updateTask.push(
            queryRunner.manager.update(target, where, data)
          );
        });

        updateResults = await Promise.all(updateTask)

      }

      if (queries && queries.length > 0) {
        let queryTasks: unknown[] = []
        queries.forEach((v: string) => {
          queryTasks.push(queryRunner.manager.query(v))
        })
        queryResults = await Promise.all(queryTasks)
      }

      if (deleteEntites && deleteEntites.length > 0) {
        removeResults = await queryRunner.manager.remove(deleteEntites)
      }

      await queryRunner.commitTransaction()

      return { status: true, data: { saveResult, updateResults, removeResults, queryResults } }

    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.log(`rollback transaction....`)
      console.log({ queryRunnerError: error })

      return { status: false, message: error?.message }
    } finally {

      await queryRunner.release()
    }

  }

  async countAsync<T>(model: EntityTarget<T>, options: FindManyOptions<T>): Promise<number>
  async countAsync<T>(model: EntityTarget<T>, options: FindManyOptions<T>, dataSource: DataSource): Promise<number>
  async countAsync<T>(model: EntityTarget<T>, options: FindManyOptions<T>, dataSource?: DataSource): Promise<number> {
    dataSource = dataSource || MysqlDataSource

    return await dataSource.manager.count(model, options);
  }

  async create<T>(model: EntityTarget<T>, data: DeepPartial<T>): Promise<T>
  async create<T>(model: EntityTarget<T>, data: DeepPartial<T>, dataSource: DataSource): Promise<T>
  async create<T>(model: EntityTarget<T>, data: DeepPartial<T>, dataSource: DataSource, t: boolean): Promise<T>
  async create<T>(model: EntityTarget<T>, data: DeepPartial<T>, dataSource?: DataSource, t?: boolean): Promise<T> {
    dataSource = dataSource || MysqlDataSource
    const newModel = dataSource.manager.create(model, data);

    if (!t) {
      return await dataSource.manager.save(newModel) as T;
    }

    return await this.QueryRunner.manager.save(newModel) as T;
  }



  async Save<T>(data: DeepPartial<T>, dataSource?: DataSource, t?: boolean): Promise<T> {
    dataSource = dataSource || MysqlDataSource

    if (!t) {
      return await dataSource.manager.save(data) as T;
    }

    return await this.QueryRunner.manager.save(data) as T;
  }

  async delete<T>(model: EntityTarget<T>, data: DeepPartial<T>, dataSource?: DataSource, t?: boolean) {
    dataSource = dataSource || MysqlDataSource

    if (!t) {
      return await dataSource.manager.delete(model, data);
    }

    return await this.QueryRunner.manager.delete(model, data);
  }


  queryBuilder<T>(model: EntityTarget<T>, alias?: string, dataSource?: DataSource) {
    dataSource = dataSource || MysqlDataSource

    return dataSource
      .createQueryBuilder(model, alias)
  }


  async stream<T>(model: EntityTarget<T>, queryBuilderName: string, condition: string, data: Object): Promise<ReadStream>;
  async stream<T>(model: EntityTarget<T>, queryBuilderName: string, condition: string, data: Object, dataSource: DataSource): Promise<ReadStream>;
  async stream<T>(model: EntityTarget<T>, queryBuilderName: string, condition: string, data: Object, dataSource?: DataSource): Promise<ReadStream>;
  async stream<T>(model: EntityTarget<T>, queryBuilderName: string, condition: string, data: Object, dataSource?: DataSource): Promise<ReadStream> {
    dataSource = dataSource || MysqlDataSource

    return await dataSource.getRepository(model)
      .createQueryBuilder(queryBuilderName)
      .where(condition, data)
      .stream();
  }


  async createMany<T>(model: EntityTarget<T>, data: DeepPartial<T[]>): Promise<T[]>
  async createMany<T>(model: EntityTarget<T>, data: DeepPartial<T[]>, dataSource: DataSource): Promise<T[]>
  async createMany<T>(model: EntityTarget<T>, data: DeepPartial<T[]>, dataSource: DataSource, t: boolean): Promise<T[]>
  async createMany<T>(model: EntityTarget<T>, data: DeepPartial<T[]>, dataSource?: DataSource, t?: boolean): Promise<T[]> {
    dataSource = dataSource || MysqlDataSource
    let createTasks: unknown[] = []

    data.forEach((item) => {
      createTasks.push(
        this.create(model, item, dataSource, t)
          .then(console.log).catch(console.log)
      )
    })

    return await Promise.all(createTasks) as T[]
  }

  async update<T>(modelName: EntityTarget<T>, condition: QueryDeepPartialEntity<T>, model: QueryDeepPartialEntity<T>): Promise<boolean>
  async update<T>(modelName: EntityTarget<T>, condition: QueryDeepPartialEntity<T>, model: QueryDeepPartialEntity<T>, dataSource: DataSource): Promise<boolean>
  async update<T>(modelName: EntityTarget<T>, condition: QueryDeepPartialEntity<T>, model: QueryDeepPartialEntity<T>, dataSource: DataSource, t: boolean): Promise<boolean>
  async update<T>(modelName: EntityTarget<T>, condition: QueryDeepPartialEntity<T>, model: QueryDeepPartialEntity<T>, dataSource?: DataSource, t?: boolean): Promise<boolean> {
    dataSource = dataSource || MysqlDataSource
    if (!t) {
      const result = await MysqlDataSource.manager.update(modelName, condition, model);
      console.log({ result })

      return result.affected > 0;
    }

    const dbUpdateResult = await this.QueryRunner.manager.update(modelName, condition, model);
    console.log({ dbUpdateResult })

    return dbUpdateResult.affected > 0
  }

  async rawQuery(query: string, dataSource?: DataSource) {
    dataSource = dataSource || MysqlDataSource;
    const rawData = await dataSource.manager.query(query);

    return rawData;
  }

  async startTransaction(): Promise<void> {

    if (this.QueryRunner != null) {

    }

    const queryRunner = MysqlDataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction()

    this.QueryRunner = queryRunner;
  }

  async commitTransaction(): Promise<void> {

    try {
      if (this.QueryRunner != null) {
        await this.QueryRunner.commitTransaction();
        await this.release();
      }

      return;
    } catch (err) {
      await this.rollbackTransaction();
      await this.release();

      throw err;
    }
  }

  async rollbackTransaction(): Promise<void> {
    if (this.QueryRunner != null) {
      await this.QueryRunner.rollbackTransaction();
    }

    return;
  }

  private async release(): Promise<void> {
    if (this.QueryRunner != null) {
      await this.QueryRunner.release();
    }

    return;
  }
}