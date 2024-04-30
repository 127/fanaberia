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
import { getPages } from "~/models/page.server";
import { authenticateUserByRole } from "~/utils/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const pages = await getPages();
  return json({ pages });
};

const filtered = ["title", "description", "keywords", "content"];

export default function WarpPagesIndex() {
  const { pages } = useLoaderData<typeof loader>();
  const cols = Object.keys(pages[0]).filter(
    (column) => !filtered.includes(column)
  );

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Pages list</h1>
      <Button as={Link} color="primary" className="w-40" to="new">
        Add new page
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
          {pages.map((page) => (
            <TableRow key={page.id}>
              {cols.map((key) => {
                const value = page[key as keyof typeof page];
                return (
                  <TableCell key={`cell-${key}`}>
                    {key === "id" ? (
                      <Link to={`${page.id}/show`} className="underline">
                        {value}
                      </Link>
                    ) : key.endsWith("_at") && value ? (
                      new Date(value as string).toUTCString()
                    ) : (
                      (value as string)
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
