/**
 * This file contains various functions for interacting with posts in a Prisma database.
 * These functions include fetching paginated posts, getting posts by category or slug,
 * creating new posts, and updating existing posts. It also defines the structure for post data.
 */
import { Post } from '@prisma/client';
import { prisma } from '~/services/db.server';
export type { Post } from '@prisma/client';

const POSTS_PER_PAGE = 9;

/**
 * Interface representing the structure of Post data.
 * @interface PostData
 */
export interface PostData {
  slug: string;
  title?: string;
  keywords?: string;
  description?: string;
  heading?: string;
  content: string;
  summary: string;
  category_id: number;
  picture?: string;
}

/**
 * Fetches paginated posts based on the page number and locale.
 *
 * @param {number} page - The current page number.
 * @param {string} [locale] - The locale to filter categories.
 * @returns {Promise<any>} The paginated posts and total pages.
 */
export const getPaginatedPosts = async (page: number, locale?: string) => {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const categories = await prisma.category.findMany({ where: { locale } });
  const categoryIds = categories.map((category) => category.id);

  const posts = await prisma.post.findMany({
    skip,
    take: POSTS_PER_PAGE,
    where: {
      category_id: { in: categoryIds },
    },
    include: {
      category: true,
    },
    orderBy: { created_at: 'desc' },
  });
  const totalPosts = await prisma.post.count({
    where: {
      category_id: { in: categoryIds },
    },
  });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return { posts, totalPages };
};

/**
 * Fetches paginated posts based on the page number and category ID.
 *
 * @param {number} page - The current page number.
 * @param {number} category_id - The category ID to filter posts.
 * @returns {Promise<{ posts: any; totalPages: number }>} The paginated posts and total pages.
 */
export const getPaginatedPostsByCategory = async (
  page: number,
  category_id: number,
): Promise<{ posts: Post[]; totalPages: number }> => {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const totalPosts = await prisma.post.count({
    where: { category_id },
  });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = await prisma.post.findMany({
    skip: skip,
    take: POSTS_PER_PAGE,
    where: { category_id },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      category: true,
    },
  });

  return { posts, totalPages };
};

/**
 * Fetches a post by its slug.
 *
 * @param {string} slug - The slug of the post.
 * @returns {Promise<any>} The post with the specified slug.
 */
export const getPostBySlug = async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  return post;
};

/**
 * Fetches all posts with optional locale filtering.
 *
 * @param {string} [locale] - The locale to filter categories.
 * @returns {Promise<any>} The list of posts.
 */
export const getPosts = async (locale?: string) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      id: 'desc',
    },
    include: {
      category: {
        where: {
          locale,
        },
      },
    },
  });

  return posts;
};

/**
 * Creates a new post.
 *
 * @param {PostData} data - The data for the new post.
 * @returns {Promise<Post>} The created post.
 */
export const createPost = async (data: PostData): Promise<Post> => {
  const post = await prisma.post.create({
    data: {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return post;
};

/**
 * Fetches a post by its ID.
 *
 * @param {number} id - The ID of the post.
 * @returns {Promise<any>} The post with the specified ID.
 */
export const getPostById = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  return post;
};

/**
 * Updates an existing post by its ID.
 *
 * @param {number} id - The ID of the post to update.
 * @param {PostData} data - The new data for the post.
 * @returns {Promise<Post>} The updated post.
 */
export const updatePost = async (id: number, data: PostData): Promise<Post> => {
  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return updatedPost;
};
