import { Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";

const userService = new UserService();

export class UserController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.createUser(getBrandId(req), req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getMe(req.user!.userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.updateMe(req.user!.userId, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.changePassword(req.user!.userId, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers(getBrandId(req));
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }
}
