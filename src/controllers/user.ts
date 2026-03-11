// Handles user management for a brand. Brand owners can invite new team members
// (staff/managers) and list everyone on their team. Only brand owners should
// be able to create new users — that's enforced at the route level.

import { Response } from "express";
import { UserService } from "../services/user";
import { AuthRequest } from "../middleware/auth";

const userService = new UserService();

export class UserController {
  async create(req: AuthRequest, res: Response) {
    try {
      const result = await userService.createUser(req.user!.brandId, req.body);

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to create user",
      });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const users = await userService.getUsers(req.user!.brandId);

      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch users",
      });
    }
  }
}
