import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getPageBySlug } from "~/models/page.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const page = await getPageBySlug(params.slug as string, params.locale);
  if (!page) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ page });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.page.title },
    { name: "description", content: data?.page.description },
    { name: "keywords", content: data?.page.keywords },
  ];
};

export default function EnFaq() {
  const { page } = useLoaderData<typeof loader>();
  return (
    <article className="w-full md:w-2/3 mx-auto prose dark:prose-invert">
      <h1>{page.heading}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
