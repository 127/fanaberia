/**
 * This file contains utility functions for managing the Category model using Prisma in a Remix application.
 * The functions include operations for fetching, creating, updating categories.
 */
import { prisma } from '~/services/db.server';
import type { Category } from '@prisma/client';
export type { Category } from '@prisma/client';

/**
 * Represents the data required to create or update a category.
 * @interface CategoryData
 */
export interface CategoryData {
  name: string;
  slug: string;
  title?: string;
  keywords?: string;
  description?: string;
  heading?: string;
  locale: string;
}

/**
 * Fetches a category by its slug.
 *
 * @param {string} slug - The slug of the category to fetch.
 * @param {string} [locale] - The locale of the category to fetch (optional).
 * @returns {Promise<Category | null>} The category with the specified slug and locale, or null if not found.
 */
export const getCategoryBySlug = async (
  slug: string,
  locale?: string,
): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { slug, locale },
  });

  return category;
};

/**
 * Fetches all categories.
 *
 * @param {string} [locale] - The locale of the categories to fetch (optional).
 * @returns {Promise<Category[]>} An array of all categories for the specified locale.
 */
export const getCategories = async (locale?: string): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: {
      locale,
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      posts: true,
    },
  });

  return categories;
};

/**
 * Creates a new category with the specified data.
 *
 * @param {CategoryData} data - The data for the new category.
 * @returns {Promise<Category>} The newly created category.
 */
export const createCategory = async (data: CategoryData): Promise<Category> => {
  const category = await prisma.category.create({ data });
  return category;
};

/**
 * Fetches a category by its ID.
 *
 * @param {number} id - The ID of the category to fetch.
 * @returns {Promise<Category | null>} The category with the specified ID, or null if not found.
 */
export const getCategoryById = async (id: number): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      posts: true,
    },
  });

  return category;
};

/**
 * Updates an existing category with the specified data.
 *
 * @param {number} id - The ID of the category to update.
 * @param {CategoryData} data - The new data for the category.
 * @returns {Promise<Category>} The updated category.
 */
export const updateCategory = async (
  id: number,
  data: CategoryData,
): Promise<Category> => {
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { ...data },
  });

  return updatedCategory;
};
