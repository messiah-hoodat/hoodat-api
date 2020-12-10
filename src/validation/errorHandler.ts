import { Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import * as Boom from '@hapi/boom';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation Failed',
      details: err?.fields,
    });
  }

  if (Boom.isBoom(err)) {
    console.warn(`Caught Boom Error for ${req.path}:`, err.output.payload);
    return res.status(err.output.statusCode).json(err.output.payload);
  }

  if (err instanceof SyntaxError) {
    console.warn(`Caught Syntax Error for ${req.path}`);
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON syntax in request body',
    });
  }

  if (err instanceof Error) {
    console.warn(`Caught Internal Server Error for ${req.path}`);
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: err.message,
    });
  }

  next(err);
}
