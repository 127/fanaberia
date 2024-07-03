import { Button, Input } from '@nextui-org/react';
import { Form, Link } from '@remix-run/react';
import { authenticateUserByRole, uploadHandler } from '~/utils/utils.server';
import { createFile } from '~/models/file.server';
import {
  json,
  redirect,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  NodeOnDiskFile,
} from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const admin = await authenticateUserByRole(request, 'admin');

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get('file') as NodeOnDiskFile;
  if (!file) {
    throw new Error('File not uploaded!');
  }

  const newFile = await createFile({
    alt: formData.get('alt') as string,
    title: formData.get('title') as string,
    admin_id: admin.id,
    name: file.name,
    mime_type: file.type,
    path: file.getFilePath(),
    size: file.size,
  });

  return redirect(`/warp/files/${newFile.id}/show`);
};

const inputs = 'alt,title'.split(',');

export default function WarpFilesNew() {
  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Add new file</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/files">
        Back
      </Button>
      <Form
        method="post"
        className="flex w-full flex-col mb-4 gap-4"
        encType="multipart/form-data">
        {inputs.map((name) => (
          <Input
            key={`input-${name}`}
            isRequired
            id={name}
            name={name}
            label={name}
            type="text"
            className="w-full"
          />
        ))}
        <input
          type="file"
          name="file"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
        />
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
