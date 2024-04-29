// Progress by chapter is written only after all tests are done
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Card, CardBody, CardHeader, Pagination } from "@nextui-org/react";
import { getPaginatedPostsByCategory } from "~/models/post.server";
import { getCategoryBySlug } from "~/models/category.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const cat = await getCategoryBySlug(params.slug as string, params.locale);
  if (!cat) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const { posts, totalPages } = await getPaginatedPostsByCategory(page, cat.id);

  return json({ posts, currentPage: page, totalPages, cat });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.cat.title },
    { name: "description", content: data?.cat.description },
    { name: "keywords", content: data?.cat.keywords },
  ];
};

export default function PostsCategories() {
  const { i18n } = useTranslation("common");
  const navigate = useNavigate();
  const { posts, currentPage, totalPages, cat } =
    useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="font-bold text-2xl">{cat.name}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 my-5">
        {posts.map((post) => (
          <Card key={post.id} className="py-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
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
            {/* <CardFooter className="px-4">
              <p className="font-semibold text-default-400 text-sm">
                Category:&nbsp;
                <Link
                  to={`/posts/categories/${post.category?.slug}`}
                  className="underline"
                >
                  {post.category?.name}
                </Link>
              </p>
            </CardFooter> */}
          </Card>
        ))}
      </div>
      <Pagination
        total={totalPages}
        initialPage={currentPage}
        onChange={(page) => {
          navigate(`?page=${page}`);
        }}
      />
    </div>
  );
}
