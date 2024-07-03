import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Button, Image } from '@nextui-org/react';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { authenticateUserByRole, fileExists } from '~/utils/utils.server';
import { deleteFile, getFileById } from '~/models/file.server';
import { promises as fs } from 'fs';

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  const file = await getFileById(Number(params.id));
  if (!file) {
    throw new Response('Not Found', { status: 404 });
  }

  await fs.unlink(file.path);
  const exists = await fileExists(file.path);
  if (exists) {
    throw new Error('File not deleted!');
  }
  await deleteFile(file.id);
  return redirect('/warp/files');
};

// Компонент для отображения деталей курса
export default function WarpFilesDelete() {
  const { file } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <div className="flex flex-row justify-between">
        <h1 className="font-bold text-lg">Delete file {file.id}?</h1>
        <div className="flex flex-row gap-4">
          <Button as={Link} color="primary" to="/warp/files">
            Back
          </Button>
          <Button as={Link} color="primary" to={`/warp/files/${file.id}/edit`}>
            Edit
          </Button>
        </div>
      </div>
      <Image src={`/storage/${file.name}`} />
      <Form method="delete">
        <Button as="button" type="submit" color="danger" className="w-full">
          Confirm Deletion
        </Button>
      </Form>
    </div>
  );
}
