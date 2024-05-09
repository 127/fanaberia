import { Button, Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import CopyToClipboard from "~/components/CopyToClipboard";
import { getFiles } from "~/models/file.server";
import { authenticateUserByRole } from "~/utils/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, "admin");
  const files = await getFiles();
  return json({ files });
};

export default function WarFilesIndex() {
  const { files } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Files list</h1>
      <Button as={Link} color="primary" className="w-40" to="new">
        Add new file
      </Button>
      <div className="flex flex-row gap-5">
        {files.map((file) => (
          <Card key={file.id} className="w-full">
            <CardBody className="items-center p-4">
              <Link to={`/warp/files/${file.id}/show`}>
                <Image
                  src={`/storage/${file.name}`}
                  alt={file.alt ?? ""}
                  className="max-h-60"
                />
              </Link>
            </CardBody>
            <CardFooter className="justify-between gap-4">
              <p className="text-sm font-semibold">{file.alt}</p>
              <CopyToClipboard
                textToCopy={`<img src="/storage/${file.name}" alt="${file.alt}" title="${file.title}" />`}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
