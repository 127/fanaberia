import type { Category } from "@prisma/client";
import { prisma } from "~/services/db.server";
export type { Category } from "@prisma/client";

interface CategoryData {
  name: string;
  slug: string;
  title?: string;
  keywords?: string;
  description?: string;
  heading?: string;
  locale: string;
}

// Функция для получения поста по slug
export const getCategoryBySlug = async (slug: string, locale?: string) => {
  const category = await prisma.category.findUnique({
    where: { slug, locale },
  });

  return category;
};
export const getCategories = async (locale?: string): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: {
      locale,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      posts: true,
    },
  });

  return categories;
};

export const createCategory = async (data: CategoryData) => {
  const category = await prisma.category.create({ data });
  return category;
};

export const getCategoryById = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      posts: true,
    },
  });

  return category;
};

export const updateCategory = async (id: number, data: CategoryData) => {
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { ...data },
  });

  return updatedCategory;
};
