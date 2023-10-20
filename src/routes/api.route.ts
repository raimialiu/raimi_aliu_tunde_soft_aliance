import { Application } from "express";
import GenreController from "../controllers/genre.controller";
import MovieController from "../controllers/movie.controller";

export const Routes = ((Route: Application): void => {

  Route.post('/genre', GenreController.create);

  Route.put('/genre/:genreId', GenreController.update);

  Route.get('/genre/:genreId', GenreController.find);

  Route.get('/enre', GenreController.findAll);

  Route.delete('/genre/:genreId', GenreController.delete);

  Route.post('/movie', MovieController.create);

  Route.put('/movie/:movieId', MovieController.update);

  Route.get('/movie/:movieId', MovieController.fetchSingle);

  Route.get('/movie', MovieController.findAll);

  Route.delete('/movie/:movieId', MovieController.delete);

});