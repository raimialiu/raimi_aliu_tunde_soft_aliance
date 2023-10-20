import { Response } from "express";
import HttpStatusCodes from "../utils/HttpStatusCodes";

/**
 * The Base Controller all other controllers should extend from. || All other controllers have to extend from this base controller and share it's methods.
 * 
 */
export default class BaseController {

  /**
   * The error response handler method all other controllers should utilize when sending an error message.
   * 
   * @param {Response} res 
   * @param {string} message 
   * @param {number} statusCode 
   * @returns {Response} 
   * 
   */
  sendErrorResponse = (res: Response, message: string, statusCode: number = HttpStatusCodes.BAD_REQUEST): Response => {
    
    return res.status(statusCode)
      .json({
        status: false,
        message
      });
  }

  /**
   * The success response handler method all other controllers should utilize when sending a success response back to the client.
   * 
   * @param {Response} res 
   * @param {Record<string, unknown>} data 
   * @param {string} message 
   * @param {number} statusCode 
   * @returns 
   * 
   */
  sendSuccessResponse = (res: Response, data: Record<string, unknown> | Record<string, unknown>[], message: string, statusCode: number = HttpStatusCodes.OK): Response => {

    return res.status(statusCode)
      .json({
        status: true,
        message,
        data
      });
  }

  /**
   * The server error response handler method all other controllers should utilize when sending an internal server error to the client.
   * 
   * @param {Response} res 
   * @param {string} message 
   * @returns 
   */
  sendServerErrorResponse = (res: Response, message: string): Response => {
    
    return res.status(HttpStatusCodes.SERVER_ERROR)
      .json({
        status: false,
        message
      });
  }

}