import {
  json,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  NodeOnDiskFile,
} from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { Button, Image, Input } from "@nextui-org/react";
import { getFileById, updateFile } from "~/models/file.server";
import { authenticateUserByRole, uploadHandler } from "~/utils/utils.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }
  const file = await getFileById(Number(params.id));
  if (!file) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ file });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const admin = await authenticateUserByRole(request, "admin");
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("file") as NodeOnDiskFile;
  if (file.size === 0) {
    await updateFile(Number(params.id), {
      alt: formData.get("alt") as string,
      title: formData.get("title") as string,
      admin_id: admin.id,
    });
  } else {
    await updateFile(Number(params.id), {
      alt: formData.get("alt") as string,
      title: formData.get("title") as string,
      admin_id: admin.id,
      name: file.name,
      mime_type: file.type,
      path: file.getFilePath(),
      size: file.size,
    });
  }
  return redirect(`/warp/files/${params.id}/show`);
};

const inputs = "alt,title".split(",");

export default function WarpFilesEdit() {
  const { file } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Edit file</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/files">
        Back
      </Button>

      <Form
        method="post"
        className="flex w-full flex-col mb-4 gap-4"
        encType="multipart/form-data"
      >
        <Image src={`/storage/${file.name}`} />
        {inputs.map((name) => (
          <Input
            key={`input-${name}`}
            isRequired
            id={name}
            name={name}
            label={name}
            type="text"
            defaultValue={String(file[name as keyof typeof file]) ?? ""}
            className="w-full"
          />
        ))}
        <input
          type="file"
          name="file"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
        />
        <p>Created at: {new Date(file.created_at).toUTCString()}</p>
        <p>Updated at: {new Date(file.updated_at).toUTCString()}</p>
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
