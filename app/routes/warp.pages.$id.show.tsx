import { Button } from '@nextui-org/react';
import { Link, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticateUserByRole } from '~/utils/utils.server';
import { getPageById } from '~/models/page.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const page = await getPageById(Number(params.id));
  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ page });
};

export default function WarpPagesShow() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Page ID: {page.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/pages">
          Back
        </Button>
        <Button as={Link} color="primary" to={`/warp/pages/${page.id}/edit`}>
          Edit
        </Button>
      </div>
      {Object.keys(page).map((name) => {
        const value = page[name as keyof typeof page];
        return (
          <p key={name}>
            <b>{name}:</b>&nbsp;
            {name.endsWith('_at') && value
              ? new Date(value as string).toUTCString()
              : (value as string)}
          </p>
        );
      })}
    </div>
  );
}
