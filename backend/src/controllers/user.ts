import { Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { AuthRequest } from "../middleware/auth";

const userService = new UserService();

export class UserController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.createUser(req.user!.brandId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers(req.user!.brandId);
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }
}
