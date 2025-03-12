import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: any) {
      const errors = error.details.map((err: any) => ({
        message: err.message,
      }));

      res.status(400).json({
        message: "Validation failed",
        errors,
      });
      return;
    }
  };
};

export const validateParams = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.params);
      next();
    } catch (error: any) {
      const errors = error.details.map((err: any) => ({
        message: err.message,
      }));

      res.status(400).json({
        message: "Invalid parameters",
        errors,
      });
      return;
    }
  };
};
