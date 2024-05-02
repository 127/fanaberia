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
import { Link, useLoaderData } from "@remix-run/react";
import { getAdmins } from "~/models/admin.server";
import { authenticateUserByRole } from "~/utils/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const admins = await getAdmins();
  return json({ admins });
};

const filtered = [
  "reset_password_token",
  "reset_password_sent_at",
  "confirmation_token",
  "password",
];

export default function WarpAdminsIndex() {
  const { admins } = useLoaderData<typeof loader>();
  const cols = Object.keys(admins[0]).filter(
    (column) => !filtered.includes(column)
  );

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Admin list</h1>
      <Button as={Link} color="primary" className="w-40" to="new">
        Add new admin
      </Button>
      <Table isStriped aria-label="Admin list">
        <TableHeader>
          {cols.map((column) => (
            <TableColumn key={column}>
              {column.replace(/_/g, " ").charAt(0).toUpperCase() +
                column.slice(1).replace(/_/g, " ")}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              {cols.map((key) => {
                const value = admin[key as keyof typeof admin];
                return (
                  <TableCell key={`cell-${key}`}>
                    {key === "id" ? (
                      <Link className="underline" to={`${value}/show`}>
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
