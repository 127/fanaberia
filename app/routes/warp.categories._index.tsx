import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { Link, useLoaderData } from '@remix-run/react';
import { type Post } from '~/models/post.server';
import { authenticateUserByRole } from '~/utils/utils.server';
import { getCategories } from '~/models/category.server';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  const categories = await getCategories();
  return json({ categories });
};

const filtered = ['title', 'description', 'keywords'];

export default function WarpCategoriesIndex() {
  const { categories } = useLoaderData<typeof loader>();
  const cols = Object.keys(categories[0]).filter(
    (column) => !filtered.includes(column),
  );
  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Categories list</h1>
      <Button as={Link} color="primary" className="w-40" to="new">
        Add new category
      </Button>
      <Table isStriped aria-label="Pages list">
        <TableHeader>
          {cols.map((column) => (
            <TableColumn key={column}>
              {column.replace(/_/g, ' ').charAt(0).toUpperCase() +
                column.slice(1).replace(/_/g, ' ')}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              {cols.map((key) => {
                const value = category[key as keyof typeof category];
                let cellValue;
                switch (key) {
                  case 'id':
                    cellValue = (
                      <Link to={`${category.id}/show`} className="underline">
                        {value as string}
                      </Link>
                    );
                    break;
                  case 'posts':
                    cellValue = (
                      <span>{(value as unknown as Post[]).length}</span>
                    );
                    break;
                  default:
                    cellValue = (
                      <span>
                        {key.endsWith('_at') && value
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
