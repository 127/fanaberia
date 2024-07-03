import { Link, useLoaderData } from '@remix-run/react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { authenticateUserByRole } from '~/utils/utils.server';
import { getUsers } from '~/models/user.server';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  const users = await getUsers();
  return json({ users });
};

const filtered = [
  'reset_password_token',
  'reset_password_sent_at',
  'confirmation_token',
  'password',
];

export default function WarpUsersIndex() {
  const { users } = useLoaderData<typeof loader>();
  const cols = Object.keys(users[0]).filter(
    (column) => !filtered.includes(column),
  );

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">User list</h1>
      <Table isStriped aria-label="User list">
        <TableHeader>
          {cols.map((column) => (
            <TableColumn key={column}>
              {column.replace(/_/g, ' ').charAt(0).toUpperCase() +
                column.slice(1).replace(/_/g, ' ')}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {cols.map((key) => {
                const value = user[key as keyof typeof user];
                return (
                  <TableCell key={`cell-${key}`}>
                    {key === 'id' ? (
                      <Link className="underline" to={`${value}/show`}>
                        {value}
                      </Link>
                    ) : key.endsWith('_at') && value ? (
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
