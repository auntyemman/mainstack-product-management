import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

// DTO Metadata Map
const dtoMetadata = new Map<string, any>();

// Global Middleware for Validation
export function GlobalValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const routeKey = req.route?.path || req.path; // Get the route path
    const DTOClass = dtoMetadata.get(routeKey);

    if (!DTOClass) return next(); // Skip if no DTO is registered

    const dataToValidate = req.method === 'GET' ? req.query : req.body;

    // Transform data to DTO
    const dtoInstance = plainToInstance(DTOClass, dataToValidate, {
      excludeExtraneousValues: true, // Whitelist fields
    });

    // Validate DTO
    validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true }).then((errors) => {
      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        });
      }

      // Replace request data with validated DTO
      if (req.method === 'GET') req.query = dtoInstance as unknown as Record<string, any>;
      else req.body = dtoInstance;

      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Validation processing failed',
    });
  }
}

// Function to register DTOs dynamically
export function RegisterDTO(route: string, DTOClass: any) {
  dtoMetadata.set(route, DTOClass);
}
