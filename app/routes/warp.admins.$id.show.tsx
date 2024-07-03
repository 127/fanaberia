import { Button } from '@nextui-org/react';
import { Link, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticateUserByRole } from '~/utils/utils.server';
import { capitalizeFirstLetter } from '~/utils/utils.common';
import { getAdminById } from '~/models/admin.server';

// Loader: Загружаем данные курса
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const admin = await getAdminById(Number(params.id));
  if (!admin) {
    throw new Response('Not Found', { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...adminWithoutPassword } = admin;
  return json({ admin: adminWithoutPassword });
};

export default function WarpAdminsShow() {
  const { admin } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Admin ID: {admin.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/admins">
          Back
        </Button>
        <Button as={Link} color="primary" to={`/warp/admins/${admin.id}/edit`}>
          Edit
        </Button>
      </div>
      {Object.keys(admin).map((key) => {
        const value = admin[key as keyof typeof admin];
        let cellValue;
        switch (key) {
          default:
            cellValue = (
              <span>
                {key.endsWith('_at') && value
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
