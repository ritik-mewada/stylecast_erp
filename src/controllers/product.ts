import { Response, NextFunction } from "express";
import { ProductService } from "../services/product";
import { AuthRequest } from "../middleware/auth";
import { ProductStatus } from "../entity/Product";

const productService = new ProductService();

export class ProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.createProduct(
        req.user!.brandId,
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, status } = req.query;
      const result = await productService.getProducts(
        req.user!.brandId,
        Number(page) || 1,
        Number(limit) || 20,
        category as string | undefined,
        status as ProductStatus | undefined,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.getProductById(
        String(req.params.id),
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.updateProduct(
        String(req.params.id),
        req.user!.brandId,
        req.body,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.archiveProduct(
        String(req.params.id),
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
