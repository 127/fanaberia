import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, Link, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Pagination,
} from "@nextui-org/react";
import { getPaginatedPosts } from "~/models/post.server";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import i18next from "~/i18next.server";

// Loader function to fetch posts
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const locale = params.locale as string;
  if (i18n.supportedLngs.indexOf(locale) === -1) {
    throw new Response("Not Found", { status: 404 });
  }
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const { posts, totalPages } = await getPaginatedPosts(page, locale);
  const t = await i18next.getFixedT(request, "common");
  return json({
    meta: {
      title: t("meta.posts.title"),
      description: t("meta.posts.description"),
      keywords: t("meta.posts.keywords"),
    },
    posts,
    currentPage: page,
    totalPages,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: "description", content: data?.meta.description },
    { name: "keywords", content: data?.meta.keywords },
  ];
};

export default function PostsIndex() {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const { posts, currentPage, totalPages } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="font-bold text-2xl">{t("nav.label.blog")}</h1>
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-3 my-5"
        data-testid="posts-list"
      >
        {posts.map((post) => (
          <Card key={post.id} className="py-4">
            <CardHeader
              className="pb-0 pt-2 px-4 flex-col items-start"
              data-testid="posts-card-header"
            >
              <h2 className="font-bold text-lg underline">
                <Link to={`/${i18n.language}/posts/${post.slug}`}>
                  {post.heading}
                </Link>
              </h2>
              <time className="text-sm text-default-500">
                {new Date(post.created_at).toLocaleDateString(i18n.language, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </CardHeader>
            <CardBody className="px-4">
              <p>{post.summary}</p>
            </CardBody>
            <CardFooter className="px-4" data-testid="posts-card-footer">
              <p className="font-semibold text-default-400 text-sm">
                {t("post.label.category")}:&nbsp;
                <Link
                  to={`/${i18n.language}/posts/categories/${post.category?.slug}`}
                  className="underline"
                >
                  {post.category?.name}
                </Link>
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Pagination
        total={totalPages}
        initialPage={currentPage}
        onChange={(page) => {
          navigate(`?page=${page}`);
        }}
        data-testid="posts-pagination"
      />
    </div>
  );
}
