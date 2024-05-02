import { Button } from "@nextui-org/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPostById } from "~/models/post.server";
import { capitalizeFirstLetter } from "~/utils/utils.common";
import { authenticateUserByRole } from "~/utils/utils.server";

// Loader: Загружаем данные курса
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const post = await getPostById(Number(params.id));
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ post });
};

export default function WarpPostsShow() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Post ID: {post.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/posts">
          Back
        </Button>
        <Button as={Link} color="primary" to={`/warp/posts/${post.id}/edit`}>
          Edit
        </Button>
      </div>
      {Object.keys(post).map((key) => {
        const value = post[key as keyof typeof post];
        let cellValue;
        switch (key) {
          case "category":
            cellValue = (
              <Link
                to={`/warp/categories/${post[key]?.id}/show`}
                className="underline"
              >
                {post[key]?.name}
              </Link>
            );
            break;
          default:
            cellValue = (
              <span>
                {key.endsWith("_at") && value
                  ? new Date(value as string).toUTCString()
                  : (value as string)}
              </span>
            );
        }
        return (
          <p key={key}>
            {capitalizeFirstLetter(key)}: {cellValue}
          </p>
        );
      })}
    </div>
  );
}
