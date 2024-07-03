/**
 * This file contains various functions for interacting with the Page data in the database.
 * It includes functions for retrieving, creating, and updating pages. The PageData interface
 * defines the structure of a page object.
 */
import { prisma } from '~/services/db.server';
import type { Page } from '@prisma/client';
export type { Page } from '@prisma/client';

/**
 * Interface representing the structure of page data.
 * @interface PageData
 */
export interface PageData {
  name: string;
  slug: string;
  title: string;
  keywords: string;
  description: string;
  heading: string;
  locale: string;
  content: string;
}

/**
 * Retrieves a page by its slug and optional locale.
 *
 * @param {string} slug - The slug of the page.
 * @param {string} [locale] - The locale of the page.
 * @returns {Promise<Page | null>} The page object if found, otherwise null.
 */
export const getPageBySlug = async (
  slug: string,
  locale?: string,
): Promise<Page | null> => {
  const page = await prisma.page.findFirst({
    where: { slug, locale },
  });

  return page;
};

/**
 * Retrieves all pages, optionally filtered by locale.
 *
 * @param {string} [locale] - The locale of the pages.
 * @returns {Promise<Page[]>} An array of page objects.
 */
export const getPages = async (locale?: string): Promise<Page[]> => {
  const pages = await prisma.page.findMany({
    where: {
      locale,
    },
    orderBy: {
      id: 'desc',
    },
  });

  return pages;
};

/**
 * Creates a new page with the provided data.
 *
 * @param {PageData} data - The data for the new page.
 * @returns {Promise<Page>} The newly created page object.
 */
export const createPage = async (data: PageData): Promise<Page> => {
  const page = await prisma.page.create({ data });
  return page;
};

/**
 * Retrieves a page by its ID.
 *
 * @param {number} id - The ID of the page.
 * @returns {Promise<Page | null>} The page object if found, otherwise null.
 */
export const getPageById = async (id: number): Promise<Page | null> => {
  const page = await prisma.page.findUnique({
    where: { id },
  });

  return page;
};

/**
 * Updates an existing page with the provided data.
 *
 * @param {number} id - The ID of the page to update.
 * @param {PageData} data - The new data for the page.
 * @returns {Promise<Page>} The updated page object.
 */
export const updatePage = async (id: number, data: PageData): Promise<Page> => {
  const updatedPage = await prisma.page.update({
    where: { id },
    data: { ...data },
  });

  return updatedPage;
};
