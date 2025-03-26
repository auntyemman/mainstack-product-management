import { Request, Response, NextFunction } from 'express';

// Define a type for the expected function signature of controller methods
type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Define a type that represents an object with string keys and controller methods as values
type Methods<T> = {
  [K in keyof T]: T[K] extends ControllerMethod ? T[K] : never;
};

// Utility type to exclude the constructor
type WithoutConstructor<T> = Omit<Methods<T>, 'constructor'>;

export type ControllerType<T> = WithoutConstructor<T>;

// main bind function
export function bindMethods<T>(controller: T): T {
  const proto = Object.getPrototypeOf(controller);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    const prop = proto[key];
    if (typeof prop === 'function' && key !== 'constructor') {
      controller[key as keyof ControllerType<T>] = prop.bind(controller);
    }
  });
  return controller;
}
