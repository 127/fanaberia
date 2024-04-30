import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getPosts } from "~/models/post.server";
import { authenticateUserByRole } from "~/utils/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const posts = await getPosts();
  return json({ posts });
};

const filtered = ["title", "description", "keywords", "content"];
export default function WarpPostsIndex() {
  const { posts } = useLoaderData<typeof loader>();
  const cols = Object.keys(posts[0]).filter(
    (column) => !filtered.includes(column)
  );

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Posts list</h1>
      <Button as={Link} color="primary" className="w-40" to="new">
        Add new post
      </Button>
      <Table isStriped aria-label="Pages list">
        <TableHeader>
          {cols.map((column) => (
            <TableColumn key={column}>
              {column.replace(/_/g, " ").charAt(0).toUpperCase() +
                column.slice(1).replace(/_/g, " ")}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              {cols.map((key) => {
                const value = post[key as keyof typeof post];
                let cellValue;
                switch (key) {
                  case "id":
                    cellValue = (
                      <Link to={`${post.id}/show`} className="underline">
                        {value as string}
                      </Link>
                    );
                    break;
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
                return <TableCell key={`cell-${key}`}> {cellValue} </TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
