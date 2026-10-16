/**
 * Generic request-body validation middleware.
 *
 * Usage:
 *   router.post("/", validate(CreateProductDto), controller.create);
 *
 * Validates req.body against the given class-validator DTO class.
 * Returns 400 with structured field errors if validation fails.
 */
import { RequestHandler } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate as cvValidate } from "class-validator";
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
