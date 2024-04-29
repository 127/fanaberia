import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardBody } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { confirmUser } from "../models/user.server";
import { AUTHENTICATION_FAILURE_PATHS } from "~/utils/utils.common";
import i18next from "../i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "common");
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || false;
  if (!token || !(await confirmUser(token))) {
    return json({
      meta: {
        title: t("meta.auth.confirm.title"),
        description: t("meta.auth.confirm.description"),
        keywords: t("meta.auth.confirm.keywords"),
      },
      error: true,
    });
  }
  return redirect(`${AUTHENTICATION_FAILURE_PATHS.user}?confirmed=true`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: "description", content: data?.meta.description },
    { name: "keywords", content: data?.meta.keywords },
  ];
};

export default function Confirm() {
  const loaderData = useLoaderData<typeof loader>();
  const { t } = useTranslation("common");

  return (
    <div className="w-2/3 mx-auto">
      <h1 className="mb-4">{t("sign.in.label")}</h1>
      <div>
        {loaderData.error && (
          <Card className="bg-warning-400">
            <CardBody>{t("sing.in.error.token")}</CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
