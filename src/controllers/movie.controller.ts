import { Request, Response } from "express";
import Controller from "./controller.base";
import HttpStatusCodes from "../utils/HttpStatusCodes";
import CloudinaryService from "../services/cloudinary.service";
import moment from "moment";
import { randomUUID } from "crypto";
import _ from "lodash"
import BaseController from "./controller.base";
import { GenreRepository } from "../services/repository/genre.repository";
import Joi from "joi";
import { GenericResponse } from "../dto/response.dto";
import { ServiceStatus } from "../enums/Status.enum";
import { GenrePivotRepository } from "../services/repository/genre-pivot.repository";
import { ErrorMessages } from "../constant/errors.constant";
import { MovieRepository } from "../services/repository/movie.repository";
import { FileArray } from "express-fileupload";
import FileSize from "filesize";

export default new class MovieController extends BaseController {

  private genRepo: GenreRepository;
  private movieRepo: MovieRepository;
  private genrePivotRepository: GenrePivotRepository;


  private response: GenericResponse = { status: false, statusCode: 400, message: "" }

  constructor() {
    super();

    this.genRepo = new GenreRepository();
    this.movieRepo = new MovieRepository();
  }

  public async validate(name: string, description: string, release_date: string, rating: number, ticket_price: number, country: string) {

    try {
      const validationSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        release_date: Joi.date().required(),
        rating: Joi.number().min(1).max(5).default(1),
        ticket_price: Joi.number().min(0).default(0),
        country: Joi.string().required()
      });

      const validationResponse = validationSchema.validate({ name, description, release_date, rating, ticket_price, country }, { abortEarly: true, allowUnknown: true });

      console.log(validationResponse.error);

      if (validationResponse.error && validationResponse.error.details.length > 0) {
        this.response.message = validationResponse.error.details[0].message;
        this.response.status = false;

        return this.response;
      }

      this.response.status = true;
      this.response.message = "Validation Passed!";

      return this.response;
    } catch (err) {
      console.log(err, "An unexpected error occurred and the Movie could not be validated!");
      this.response.status = false;
      this.response.message = "An unexpected error occurred and the Movie could not be validated!";

      return this.response;
    }

  }

  public fileCheckValidate(Payload: FileArray) {

    try {
      /* Get the filesize && extension */
      const fileName: string = Payload.coverImage['name'];
      const fileSizeNumeric: number = Math.round(parseFloat(FileSize(Payload.coverImage['size']).split(' ')[0]));
      const fileSizeString: string = FileSize(Payload.coverImage['size']).split(' ')[1];
      const fileExtensionArray: string[] = fileName.split('.');
      const fileExtension: string = fileExtensionArray[fileExtensionArray.length - 1];

      if (fileSizeString == 'KB' || fileSizeString == 'B') {
        this.response.statusCode = HttpStatusCodes.BAD_REQUEST;
        this.response.message = "Sorry, The uploaded file exeeds the acceptable limit!";

        return this.response;
      }

      if (fileSizeString == 'MB') {
        /* Do Code Validations */
        if (fileSizeNumeric > 5) {
          this.response.status = true
          this.response.message = 'Sorry, The uploaded image is too large!'
          this.response.statusCode = HttpStatusCodes.BAD_REQUEST

          return this.response;
        }
      }

      if (['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'].includes(fileSizeString)) {

        this.response.status = true
        this.response.message = 'Sorry, The uploaded image is too large!'
        this.response.statusCode = HttpStatusCodes.BAD_REQUEST

        return this.response;
      }

      if (!['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'heic'].includes(fileExtension.toLocaleLowerCase())) {
        this.response.status = true;
        this.response.message = 'Please, upload a valid image file!';
        this.response.statusCode = HttpStatusCodes.BAD_REQUEST;

        return this.response;
      }

      this.response.status = true;
      this.response.message = "Validation Passed!";

      return this.response;
    } catch (err: unknown) {
      console.log(err, "An unexpected error occurred and the Movie could not be validated!");

      this.response.status = false;
      this.response.message = "An unexpected error occurred and the Genre could not be validated!";

      return this.response;
    }
  }

  create = async (req: Request, res: Response) => {

    try {
      const payload = req.files;
      const { name, description, release_date, rating, ticket_price, country, genres } = req.body as {
        name: string, description: string, release_date: string, rating: number, ticket_price: number, country: string, genres: string[]
      };

      // Validate The Movie Object
      const validator = await this.validate(name, description, release_date, rating, ticket_price, country);
      if (!validator.status) {
        return this.sendErrorResponse(res, validator.message, validator.statusCode);
      }

      // Validate the Photo Object
      const isPhotoValid = await this.fileCheckValidate(payload);
      if (!isPhotoValid.status) {
        return this.sendErrorResponse(res, isPhotoValid.message, isPhotoValid.statusCode);
      }

      // Validate the Genres...
      const areGenresValid = await this.genRepo.findGenreWithIds(ServiceStatus.Active, genres, "asc");
      if (areGenresValid.length != genres.length) {
        return this.sendErrorResponse(res, "Sorry, You have some inactive Genres! Please, update your selection and try again!", HttpStatusCodes.BAD_REQUEST);
      }

      // Upload the images to cloudinary...
      const imageUrl = await CloudinaryService.upload(payload);

      const movie = await this.movieRepo.createMovie({
        name,
        slug: _.snakeCase(name),
        description,
        release_date: moment(release_date).toDate(),
        rating,
        ticket_price,
        country,
        photo: imageUrl,
        reference: randomUUID(),
        status_id: ServiceStatus.Active
      });

      await this.genrePivotRepository.bulkPivot(genres.map(el => {
        return {
          genre_id: el,
          movie_id: movie.id
        }
      }));

      return this.sendSuccessResponse(res, { movie }, "OK", HttpStatusCodes.CREATED);
    } catch (err) {
      console.log({ createMovieError: err });

      return this.sendErrorResponse(res, ErrorMessages.GenericFailure);
    }

  }

  update = async (req: Request, res: Response) => {

    try {
      const uploadedFiles = req.files;
      const { movieId } = req.params;
      const { name, description, release_date, rating, ticket_price, country, genres, } = req.body as {
        name: string, description: string, release_date: string, rating: number, ticket_price: number, country: string, genres: string[]
      };


      // Validate the Genres...
      const areGenresValid = await this.genRepo.findGenreWithIds(ServiceStatus.Active, genres, "asc");
      if (areGenresValid.length != genres.length) {
        return this.sendErrorResponse(res, "Sorry, You have some inactive Genres! Please, update your selection and try again!", HttpStatusCodes.BAD_REQUEST);
      }

      // Upload the images to cloudinary...
      const imageUrl = await CloudinaryService.upload(uploadedFiles);

      const movie = await this.movieRepo.updateMovie({ id: movieId }, {
        name,
        slug: _.snakeCase(name),
        description,
        release_date: moment(release_date).toDate(),
        rating,
        ticket_price,
        country,
        photo: imageUrl,
        reference: randomUUID(),
        status_id: ServiceStatus.Active
      });

      await this.genrePivotRepository.deletePivot({ movie_id: movieId });

      await this.genrePivotRepository.bulkPivot(genres.map(el => {
        return {
          genre_id: el,
          movie_id: movieId
        }
      }));

      return this.sendSuccessResponse(res, { movie }, "Your movie has been created successfully!", HttpStatusCodes.CREATED);
    } catch (err) {
      console.log(err, "An unexpected error occurred and the movie could not be updated!");

      return this.sendErrorResponse(res, "Sorry, This movie could not be updated!");
    }
  }

  fetchSingle = async (req: Request, res: Response) => {
    try {
      const { movieId } = req.params;

      const isMovieValid = await this.movieRepo.findOneMovie({ id: movieId });
      if (!isMovieValid) {
        return this.sendErrorResponse(res, "no match found....", HttpStatusCodes.NOT_FOUND);
      }

      return this.sendSuccessResponse(res, { movie: isMovieValid }, "OK");
    } catch (err) {
      console.log({ fetchError: err });

      return this.sendErrorResponse(res, "!!oops, please try again");
    }
  }

  findAll = async (req: Request, res: Response) => {

    try {

      const movies = await this.movieRepo.findAllMovie({}, "DESC");

      return this.sendSuccessResponse(res, { movies: movies }, "The selected movies has been retrieved successfully!");
    } catch (err) {
      console.log(err, "An unexpected error occurred and the movie could not be retrieved!");

      return this.sendErrorResponse(res, "Sorry, This movie could not be retrieved!");
    }
  }

  delete = async (req: Request, res: Response) => {
    try {

      const { movieId } = req.params;

      const isMovieValid = await this.movieRepo.findOneMovie({ id: movieId });
      if (!isMovieValid) {
        return this.sendErrorResponse(res, "no match found", HttpStatusCodes.NOT_FOUND);
      }

      await this.movieRepo.deleteMovie({ id: movieId });
      await this.genrePivotRepository.deletePivot({ movie_id: movieId });

      return this.sendSuccessResponse(res, { movie: isMovieValid }, "DELETED");

    } catch (err) {
      console.log({ deleteError: err });

      return this.sendErrorResponse(res, ErrorMessages.GenericFailure);
    }
  }
}