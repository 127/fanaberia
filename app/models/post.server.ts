import { prisma } from "~/services/db.server";
export type { Post } from "@prisma/client";

const POSTS_PER_PAGE = 9;

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

export async function getPaginatedPosts(page: number, locale?: string) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const categories = await prisma.category.findMany({ where: { locale } });
  const categoryIds = categories.map((category) => category.id);

  // Затем фильтруем посты по этим категориям
  const posts = await prisma.post.findMany({
    skip,
    take: POSTS_PER_PAGE,
    where: {
      category_id: { in: categoryIds },
    },
    include: {
      category: true,
    },
    orderBy: { created_at: "desc" },
  });
  const totalPosts = await prisma.post.count({
    where: {
      category_id: { in: categoryIds },
    },
  });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return { posts, totalPages };
  //: Promise<{ posts: Post[]; totalPages: number }>
  // const skip = (page - 1) * POSTS_PER_PAGE;
  // const totalPosts = await prisma.post.count();
  // const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // const posts = await prisma.post.findMany({
  //   skip: skip,
  //   take: POSTS_PER_PAGE,
  //   orderBy: {
  //     created_at: "desc",
  //   },
  //   include: {
  //     category: {
  //       where: {
  //         locale,
  //       },
  //     },
  //   },
  // });

  // return { posts, totalPages };
}

export async function getPaginatedPostsByCategory(
  page: number,
  category_id: number
) {
  //: Promise<{ posts: Post[]; totalPages: number }>
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
      created_at: "desc",
    },
    include: {
      category: true,
    },
  });

  return { posts, totalPages };
}

// Функция для получения поста по slug
export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  return post;
}

export const getPosts = async (locale?: string) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      id: "desc",
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

export async function createPost(data: PostData) {
  const post = await prisma.post.create({
    data: {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return post;
}

export async function getPostById(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  return post;
}

export async function updatePost(id: number, data: PostData) {
  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return updatedPost;
}
