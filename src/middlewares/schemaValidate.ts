import { Request, Response, NextFunction } from "express";
import { Schema, ValidationErrorItem } from "joi";

interface ValidationError {
  message: string;
  path?: (string | number)[];
  type?: string;
  context?: Record<string, any>;
}

export const schemaValidate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err: any) {
      console.error(err);
      const errors: ValidationError[] = err.details || [];
      next({ errors, status: 400 });
    }
  };
};
