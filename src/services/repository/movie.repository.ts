import { Movie } from "../../model/movie.model";
import { FindOptionsOrderValue } from "typeorm";
import { DataAccessService } from "../data-access/data-access.service";

export class MovieRepository extends DataAccessService {

  constructor() { super(); }

  async createMovie(movie: Movie) {

    return await this.create(Movie, movie);

  }

  async findOneMovie(movie: Partial<Movie>) {

    return await this.findOne(Movie, { where: { ...movie } });

  }

  async findAllMovie(movie: Partial<Movie>, orderOptions: FindOptionsOrderValue = "ASC") {

    return await this.findMany(Movie, { where: { ...movie }, order: { created_at: orderOptions } });

  }

  async updateMovie(condition: Partial<Movie>, changes: Partial<Movie>) {

    return await this.update(Movie, condition, changes);

  }

  async deleteMovie(condition: Partial<Movie>) {

    return await this.delete(Movie, condition);

  }

}