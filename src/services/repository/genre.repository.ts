import { FindOptionsOrderValue, In } from "typeorm";
import { Genre } from "../../model/genre.model";
import { DataAccessService } from "../data-access/data-access.service";
import Joi from "joi";
import { GenericResponse } from "../../dto/response.dto";
import HttpStatusCodes from "../../utils/HttpStatusCodes";
import { ServiceStatus } from "../../enums/Status.enum";

export class GenreRepository extends DataAccessService {

  constructor() { super(); }

  private response: GenericResponse = { status: false, message: "", statusCode: 400 }

  async createGenre(genre: Genre) {
    const { status, message } = await this.validateGenrCreation(genre.name, genre.status_id == ServiceStatus.Active)
    if (!status) {
      throw new Error(`genre creation failed...`)
    }

    return await this.create(Genre, genre);
  }

  async findOneGenre(genre: Partial<Genre>) {
    return await this.findOne(Genre, { where: { ...genre } });
  }

  async findAllGenre(genre: Partial<Genre>, orderOptions: FindOptionsOrderValue = "ASC") {
    return await this.findMany(Genre, { where: { ...genre }, order: { created_at: orderOptions } });
  }

  async findGenreWithIds(status: number, ids: string[], orderOptions: FindOptionsOrderValue = "ASC") {
    return await this.findMany(Genre, {
      where: {
        id: In(ids),
        status_id: status
      },
      order: {
        created_at: orderOptions
      }
    })
  }

  async updateGenre(condition: Partial<Genre>, changes: Partial<Genre>) {

    return await this.update(Genre, condition, changes);

  }

  async deleteGenre(condition: Partial<Genre>) {

    return await this.delete(Genre, condition);

  }

  public async validateGenrCreation(name: string, is_active: boolean) {

    try {
      const validationSchema = Joi.object({
        name: Joi.string().required(),
        is_active: Joi.boolean().required()
      });

      const { error, value } = validationSchema.validate({ name, is_active }, { abortEarly: true });
      const isGenreNameUnique = await this.findOneGenre({ name });

      if (error && error.details.length > 0) {
        this.response.message = error.details[0].message;
        this.response.status = false;
        return this.response;
      }

      if (isGenreNameUnique) {
        this.response.status = false;
        this.response.message = "name already exists!";
        this.response.statusCode = HttpStatusCodes.CONFLICT;

        return this.response;
      }

      this.response.status = true;
      this.response.message = "OK";

      return this.response;
    } catch (err) {
      console.log({ validateCreateGenreError: err });
      this.response.status = false;
      this.response.message = "!!oops, that did not go as planned, would you be kind enough to try again";

      return this.response;
    }

  }

}