import { Response } from "express";
import { ProductService } from "../services/product";
import { AuthRequest } from "../middleware/auth";
import { ProductStatus } from "../entity/Product";

const productService = new ProductService();

export class ProductController {
  async create(req: AuthRequest, res: Response) {
    try {
      const result = await productService.createProduct(
        req.user!.brandId,
        req.body,
      );

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to create product",
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const { page, limit, category, status } = req.query;

      const result = await productService.getProducts(
        req.user!.brandId,
        Number(page) || 1,
        Number(limit) || 20,
        category as string | undefined,
        status as ProductStatus | undefined,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch products",
      });
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const result = await productService.getProductById(
        String(req.params.id),
        req.user!.brandId,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message || "Failed to fetch product",
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await productService.updateProduct(
        String(req.params.id),
        req.user!.brandId,
        req.body,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to update product",
      });
    }
  }

  async archive(req: AuthRequest, res: Response) {
    try {
      const result = await productService.archiveProduct(
        String(req.params.id),
        req.user!.brandId,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to archive product",
      });
    }
  }
}
