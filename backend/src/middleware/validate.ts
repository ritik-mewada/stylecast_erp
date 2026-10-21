/**
 * Generic request-body validation middleware.
 *
 * Usage:
 *   router.post("/", validate(CreateProductDto), controller.create);
 *
 * Validates req.body against the given class-validator DTO class.
 * Returns 400 with structured field errors if validation fails.
 */
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { isUUID, validate as cvValidate } from "class-validator";
import { AppError } from "../utils/AppError";

export function validate<T extends object>(
  DtoClass: ClassConstructor<T>,
): RequestHandler {
  return async (req, _res, next) => {
    const dto = plainToInstance(DtoClass, req.body as Record<string, unknown>);
    const errors = await cvValidate(dto, {
      whitelist: true,        // strip unknown properties
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      return next(new AppError(400, messages.join("; ")));
    }

    req.body = dto;
    next();
  };
}

/**
 * Route-param validator for UUID ids.
 *
 * Usage:
 *   router.param("id", uuidParam);
 *
 * Rejects malformed ids with 400 before they reach Postgres, which would
 * otherwise fail the query with a 500.
 */
export const uuidParam = (
  _req: Request,
  _res: Response,
  next: NextFunction,
  value: unknown,
  name: string,
): void => {
  if (!isUUID(String(value))) {
    return next(new AppError(400, `${name} must be a valid UUID`));
  }
  next();
};
