import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { getPostBySlug } from "~/models/post.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await getPostBySlug(params.slug as string);
  if (!post || (post.category && post.category.locale !== params.locale)) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.post.title },
    { name: "description", content: data?.post.description },
    { name: "keywords", content: data?.post.keywords },
  ];
};

// Компонент для отображения поста
export default function PostPage() {
  const { i18n } = useTranslation("common");
  const { post } = useLoaderData<typeof loader>();

  return (
    <article className="flex flex-col gap-4 w-full prose dark:prose-invert max-w-none">
      <h1>{post.heading}</h1>
      <time className="text-sm text-default-500">
        {new Date(post.created_at).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
