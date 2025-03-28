import { Container } from "inversify";
import { AuthController } from "../auth.controller";
import { AuthenticationService } from "../auth.service";
import { UserService } from "../../users/user.service";
import { UserRepository } from "../../users/user.repository";
import { AUTH_TYPES } from "./auth.types";
import { USER_TYPES } from "../../users/di/user.types";


export const authContainer = new Container();

// Bind dependencies
authContainer.bind(AUTH_TYPES.AuthService).to(AuthenticationService);
authContainer.bind(AUTH_TYPES.AuthController).to(AuthController);

// other services binding to auth service
authContainer.bind(USER_TYPES.UserService).to(UserService);
authContainer.bind(USER_TYPES.UserRepository).to(UserRepository);