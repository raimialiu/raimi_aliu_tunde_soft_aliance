import Controller from "./controller.base";
import { GenreRepository } from '../services/repository/genre.repository'
import { Request, Response } from "express";
import HttpStatusCodes from "../utils/HttpStatusCodes";
// import { Status } from "../enums/Status.enum";
import { GenrePivotRepository } from "../services/repository/genre-pivot.repository";
import BaseController from "./controller.base";
import { ServiceStatus } from "../enums/Status.enum";


export default new class GenreController extends BaseController {

  private genreRepo: GenreRepository;
  private movieGenrePivotRepository: GenrePivotRepository;

  constructor() {
    super();
    this.genreRepo = new GenreRepository();
    this.movieGenrePivotRepository = new GenrePivotRepository();
  }


  async create(req: Request, res: Response) {

    try {

      const { name, is_active } = req.body as { name: string, is_active: boolean };
      const genre = await this.genreRepo.createGenre({ name, status_id: is_active ? ServiceStatus.Active : ServiceStatus.Inactive })

      return this.sendSuccessResponse(res, { genre }, "created!", HttpStatusCodes.CREATED);
    } catch (err) {
      // console.log(err, "An unexpected error occurred and the Genre could not be created!");
      return this.sendErrorResponse(res, "failed to create");
    }

  }

  async update(req: Request, res: Response) {
    try {
      const { name, is_active } = req.body as { name: string, is_active: boolean };
      const { genreId } = req.params;

      const updatedGenre = await this.genreRepo.updateGenre({ id: genreId }, { name, status_id: is_active ? ServiceStatus.Active : ServiceStatus.Inactive });
      if (updatedGenre) {
        return this.sendSuccessResponse(res, {}, "Your Genre has been updated successfully!");
      }

      return this.sendErrorResponse(res, "operation failed, Please, try again!", HttpStatusCodes.BAD_REQUEST);
    } catch (err) {
      console.log(err, "An unexpected error occurred and the Genre could not be updated!");

      return this.sendErrorResponse(res, "A server error occurred and this Genre could not be updated!");

    }
  }

  async find(req: Request, res: Response) {

    try {

      const { genreId } = req.params;
      const findOne = await this.genreRepo.findOneGenre({ id: genreId });
      if (!findOne) {
        return this.sendErrorResponse(res, "no match found", HttpStatusCodes.NOT_FOUND);
      }

      return this.sendSuccessResponse(res, { genre: findOne }, "Genre retrieved successfully!");
    }
    catch (err) {
      console.log(err, "An unexpected error occurred and the Genre could not be retrieved!");

      return this.sendErrorResponse(res, "A server error occurred and this Genre could not be retrieved!");
    }
  }


  async findAll(req: Request, res: Response) {
    const findAll = await this.genreRepo.findAllGenre({}, "ASC");

    return this.sendSuccessResponse(res, { findAll }, "Genre retrieved OK!");
  }

  async delete(req: Request, res: Response) {

    try {
      const { id } = req.params
      const findOne = await this.genreRepo.findOneGenre({ id });

      if (!findOne) {
        return this.sendErrorResponse(res, "no match found", HttpStatusCodes.NOT_FOUND);
      }

      const genreDeleteResult = await this.genreRepo.deleteGenre({ id });
      const delResult = this.movieGenrePivotRepository.deletePivot({ genre_id: id });

      if (genreDeleteResult?.affected > 0) {
        return this.sendSuccessResponse(res, { genre: genreDeleteResult }, "Genre deleted successfully!");
      }

      return this.sendErrorResponse(res, 'error deleting pivot')

    } catch (er) {
      return this.sendErrorResponse(res, "A server error occurred and this Genre could not be deleted!");
    }








  }

}