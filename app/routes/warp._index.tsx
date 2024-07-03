import { Link } from '@remix-run/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { authenticateUserByRole } from '~/utils/utils.server';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  return json({});
};

export const meta: MetaFunction = () => [{ title: 'Warp' }];

const links = ['posts', 'categories', 'users', 'pages', 'files', 'admins'];
export default function WarpIndex() {
  // const loaderData = useLoaderData<typeof loader>()
  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Warp Index</h1>
      <Listbox aria-label="Actions" className="underline" id="mnuList">
        {links.map((item) => (
          <ListboxItem
            key={item}
            textValue={item}
            aria-labelledby="mnuList"
            aria-describedby="mnuList">
            <Link to={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  );
}
