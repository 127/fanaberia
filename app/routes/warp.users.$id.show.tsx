import { Button } from '@nextui-org/react';
import { Link, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticateUserByRole } from '~/utils/utils.server';
import { capitalizeFirstLetter } from '~/utils/utils.common';
import { getUserById } from '~/models/user.server';

// Loader: Загружаем данные курса
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const user = await getUserById(Number(params.id));
  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return json({ user: userWithoutPassword });
};

export default function WarpUsersShow() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">User ID: {user.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/users">
          Back
        </Button>
        {/* <Button as={Link} color="primary" to={`/warp/users/${user.id}/edit`}>
          Edit
        </Button> */}
      </div>
      {Object.keys(user).map((key) => {
        const value = user[key as keyof typeof user];
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
