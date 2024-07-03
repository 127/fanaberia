import { Button, Divider, Image } from '@nextui-org/react';
import { Link, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticateUserByRole } from '~/utils/utils.server';
import { getFileById } from '~/models/file.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const file = await getFileById(Number(params.id));
  if (!file) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ file });
};

const inputs =
  'name,alt,title,path,mime_type,size,created_at,updated_at,admin_id'.split(
    ',',
  );

export default function WarpFilesShow() {
  const { file } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">File ID: {file.id}</h1>
      <div className="flex flex-row gap-4">
        <Button as={Link} color="primary" to="/warp/files">
          Back
        </Button>
        <Button as={Link} color="primary" to={`/warp/files/${file.id}/edit`}>
          Edit
        </Button>
      </div>
      <Image src={`/storage/${file.name}`} />
      {inputs.map((name) => (
        <p key={name}>
          <b>{name}:</b>{' '}
          {name.endsWith('_at')
            ? new Date(file[name as keyof typeof file] as string).toUTCString()
            : file[name as keyof typeof file]}
        </p>
      ))}
      <Divider className="my-12" />
      <Button
        as={Link}
        to={`/warp/files/${file.id}/delete`}
        color="danger"
        className="w-12">
        Delete
      </Button>
    </div>
  );
}
