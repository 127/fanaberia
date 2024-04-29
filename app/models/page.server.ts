import type { Page } from "@prisma/client";
import { prisma } from "~/services/db.server";
export type { Page } from "@prisma/client";

interface PageData {
  name: string;
  slug: string;
  title: string;
  keywords: string;
  description: string;
  heading: string;
  locale: string;
  content: string;
}

export const getPageBySlug = async (slug: string, locale?: string) => {
  const page = await prisma.page.findFirst({
    where: { slug, locale },
  });

  return page;
};
export const getPages = async (locale?: string): Promise<Page[]> => {
  const pages = await prisma.page.findMany({
    where: {
      locale,
    },
    orderBy: {
      id: "desc",
    },
  });

  return pages;
};

export const createPage = async (data: PageData) => {
  const page = await prisma.page.create({ data });
  return page;
};

export const getPageById = async (id: number) => {
  const page = await prisma.page.findUnique({
    where: { id },
  });

  return page;
};

export const updatePage = async (id: number, data: PageData) => {
  const updatedPage = await prisma.page.update({
    where: { id },
    data: { ...data },
  });

  return updatedPage;
};
