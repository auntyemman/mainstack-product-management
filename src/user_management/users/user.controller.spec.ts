import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { USER_TYPES } from "./di/user.types";
import { validateRequest } from "../../shared/utils/request_validator";
import { UpdateDTO } from "./user.dto";
import { successResponse } from "../../shared/utils/api_response";
import { Request, Response, NextFunction } from "express";
import { Container } from "inversify";

jest.mock("../../shared/utils/request_validator");

const mockUserService = {
  getUser: jest.fn(),
  updateUser: jest.fn(),
  makeAdmin: jest.fn(),
};

const mockRequest = {} as Request;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  clearCookie: jest.fn(),
  locals: { user: { _id: "123", email: "test@example.com", firstName: "Foo" } },
} as unknown as Response;

const mockNext: NextFunction = jest.fn();

const container = new Container();
container.bind<UserService>(USER_TYPES.UserService).toConstantValue(mockUserService as any);
const userController = new UserController(mockUserService as any);

describe("UserController Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the logged-in user profile", async () => {
    await userController.getProfile(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      successResponse(200, "profile in session fetched successfully", mockResponse.locals.user)
    );
  });

  it("should fetch a specific user by ID", async () => {
    const mockUser = { _id: "123", email: "test@example.com", firstName: "Foo" };
    mockUserService.getUser.mockResolvedValue(mockUser);
    mockRequest.params = { id: "123" };

    await userController.getUser(mockRequest, mockResponse, mockNext);
    expect(mockUserService.getUser).toHaveBeenCalledWith("123");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      successResponse(200, "User fetched successfully", mockUser)
    );
  });

  it("should update the user profile successfully", async () => {
    const updatedData = { firstName: "Updated User" };
    const updatedUser = { _id: "123", email: "test@example.com", ...updatedData };
    (validateRequest as jest.Mock).mockResolvedValue(updatedData);
    mockUserService.updateUser.mockResolvedValue(updatedUser);

    mockRequest.body = updatedData;
    await userController.updateProfile(mockRequest, mockResponse, mockNext);

    expect(validateRequest).toHaveBeenCalledWith(UpdateDTO, updatedData);
    expect(mockUserService.updateUser).toHaveBeenCalledWith("123", updatedData);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      successResponse(200, "Profile updated successfully", updatedUser)
    );
  });

  it("should log out the user successfully", async () => {
    await userController.logout(mockRequest, mockResponse, mockNext);
    expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken", expect.any(Object));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      message: "Logged out successfully",
    });
  });

  it("should make a user an admin successfully", async () => {
    const userId = "123";
    const mockAdminUser = { _id: userId, email: "test@example.com", role: "admin" };
    mockUserService.makeAdmin.mockResolvedValue(mockAdminUser);

    mockRequest.params = { id: userId };
    await userController.makeAdmin(mockRequest, mockResponse, mockNext);

    expect(mockUserService.makeAdmin).toHaveBeenCalledWith(userId);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      successResponse(200, "User made an admin successfully", mockAdminUser)
    );
  });
});