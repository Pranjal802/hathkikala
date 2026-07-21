import type { Request, Response } from 'express';
import Category from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { slugify } from '../utils/slugify.js';
import type { CreateCategoryDto, UpdateCategoryDto } from '../dtos/CategoryDtos.js';

function toCategoryResponse(c: InstanceType<typeof Category>) {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    icon: c.icon ?? null,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  };
}

// GET /api/categories
export async function listCategories(req: Request, res: Response) {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

  return res.status(200).json({
    success: true,
    data: {
      categories: categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        icon: c.icon ?? null,
      })),
    },
  });
}

// GET /api/categories/admin/all - admin only, includes inactive categories
export async function listAllCategoriesAdmin(req: Request, res: Response) {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

  return res.status(200).json({
    success: true,
    data: { categories: categories.map(toCategoryResponse) },
  });
}

// POST /api/categories - admin only
export async function createCategory(req: Request, res: Response) {
  const body = req.body as CreateCategoryDto;
  const slug = slugify(body.name);

  const category = await Category.create({
    name: body.name,
    slug,
    sortOrder: body.sortOrder,
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.icon !== undefined ? { icon: body.icon } : {}),
  });

  return res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category: toCategoryResponse(category) },
  });
}

// PATCH /api/categories/:id - admin only
export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as UpdateCategoryDto;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (body.name !== undefined) {
    category.name = body.name;
    category.slug = slugify(body.name); // keep slug in sync with a renamed category
  }
  if (body.description !== undefined) category.description = body.description;
  if (body.icon !== undefined) category.icon = body.icon;
  if (body.sortOrder !== undefined) category.sortOrder = body.sortOrder;
  if (body.isActive !== undefined) category.isActive = body.isActive;

  await category.save();

  return res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category: toCategoryResponse(category) },
  });
}

// DELETE /api/categories/:id - admin only
// Soft delete: categories are referenced by products, so we deactivate
// rather than remove the document to avoid orphaning product.categoryId.
export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isActive = false;
  await category.save();

  return res.status(200).json({
    success: true,
    message: 'Category deactivated successfully',
  });
}
