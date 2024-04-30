// app/routes/warp.courses.$id.tsx
import { Button } from "@nextui-org/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCategoryById } from "~/models/category.server";
import { Post } from "~/models/post.server";
import { capitalizeFirstLetter } from "~/utils/utils.common";
import { authenticateUserByRole } from "~/utils/utils.server";

// Loader: Загружаем данные курса
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const category = await getCategoryById(Number(params.id));
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ category });
};

// Компонент для отображения деталей курса
export default function WarpCategoriesShow() {
  const { category } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Category ID: {category.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/categories">
          Back
        </Button>
        <Button
          as={Link}
          color="primary"
          to={`/warp/categories/${category.id}/edit`}
        >
          Edit
        </Button>
      </div>
      {Object.keys(category).map((key) => {
        const value = category[key as keyof typeof category];
        let cellValue;
        switch (key) {
          case "posts":
            cellValue = <span>{(value as unknown as Post[]).length}</span>;
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
