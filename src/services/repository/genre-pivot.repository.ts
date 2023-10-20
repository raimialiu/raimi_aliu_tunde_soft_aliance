import { MovieGenrePivot } from "../../model/Genre-Pivot.model";
import { DataAccessService } from "../data-access/data-access.service";

export class GenrePivotRepository extends DataAccessService {

  constructor() { super(); }

  async createPivot(model: MovieGenrePivot) {

    return await this.create(MovieGenrePivot, model);

  }

  async bulkPivot(model: MovieGenrePivot[]) {

    return await this.bulkInsert(MovieGenrePivot, model);

  }

  async updatePivot(condition: Partial<MovieGenrePivot>, changes: Partial<MovieGenrePivot>) {

    return await this.update(MovieGenrePivot, condition, changes);

  }

  async deletePivot(condition: Partial<MovieGenrePivot>) {

    return await this.delete(MovieGenrePivot, condition);

  }

}