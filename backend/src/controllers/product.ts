import { Response, NextFunction } from "express";
import { ProductService } from "../services/product";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { ProductStatus } from "../entity/Product";
import { enumQuery, stringQuery } from "../utils/query";

const productService = new ProductService();

export class ProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.createProduct(
        getBrandId(req),
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, status, search } = req.query;
      const result = await productService.getProducts(
        getBrandId(req),
        page,
        limit,
        {
          category: stringQuery(category),
          status: enumQuery(status, ProductStatus, "status"),
          search: stringQuery(search),
        },
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
        getBrandId(req),
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
        getBrandId(req),
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
        getBrandId(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
