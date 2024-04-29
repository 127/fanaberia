import type {
  ActionFunctionArgs,
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { type ResponseError } from "~/utils/utils.server";
import { AUTHENTICATION_FAILURE_PATHS } from "~/utils/utils.common";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { resetPassword, userIsRecovering } from "~/models/user.server";
import { ValidationError } from "yup";
import i18next from "~/i18next.server";
import passwordRecoveredValidationSchema from "~/validators/passwordRecoveredValidationSchema";

async function checkToken(request: Request, meta?: ResponseError["meta"]) {
  const t = await i18next.getFixedT(request, "common");
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  let err = null;
  if (token === null || !(await userIsRecovering(token))) {
    err = json<ResponseError>(
      { meta, errors: { message: t("recover.reset.impossible") } },
      { status: 400 }
    );
  }
  return { t, token, err };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "common");
  const meta = {
    title: t("meta.auth.recovered-reset.title"),
    description: t("meta.auth.recovered-reset.description"),
    keywords: t("meta.auth.recovered-reset.keywords"),
  };
  const { err } = await checkToken(request, meta);
  if (err !== null) return err;
  return json<ResponseError>({
    meta,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { token, err } = await checkToken(request);
  if (err !== null) return err;

  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);
  const validationResult = await passwordRecoveredValidationSchema()
    .validate(formObj, { abortEarly: false })
    .catch((err) => {
      const errors: Record<string, string> = {};
      if (err instanceof ValidationError && err.inner) {
        err.inner.forEach((error: ValidationError) => {
          const path = error.path || "unknown";
          if (!errors[path]) {
            errors[path] = error.message;
          }
        });
      }
      return errors;
    });

  // on errors return success
  if (validationResult !== formObj) {
    // console.log(validationResult);
    return json<ResponseError>({ errors: validationResult } as ResponseError, {
      status: 400,
    });
  }
  const password = formData.get("password") as string;
  await resetPassword(token as string, password);
  return redirect(`${AUTHENTICATION_FAILURE_PATHS.user}?recovered=true`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta?.title },
    { name: "description", content: data?.meta?.description },
    { name: "keywords", content: data?.meta?.keywords },
  ];
};

export default function Reset() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">{t("recover.heading")}</h1>
      {loaderData?.errors?.message ? (
        <Card className="flex gap-4 bg-success-200" key="recover-inited">
          <CardBody>{loaderData.errors.message}</CardBody>
        </Card>
      ) : (
        <Form method="post" className="flex w-full flex-col mb-4 gap-4">
          <Input
            isRequired
            label="Password"
            name="password"
            type="password"
            variant="bordered"
            autoComplete="new-password"
            {...(actionData?.errors?.password
              ? {
                  isInvalid: true,
                  errorMessage: t(actionData.errors.password),
                }
              : { isInvalid: false, errorMessage: null })}
          />
          <Input
            isRequired
            label="Confirm password"
            type="password"
            name="passwordConfirmation"
            variant="bordered"
            autoComplete="new-password"
            {...(actionData?.errors?.passwordConfirmation
              ? {
                  isInvalid: true,
                  errorMessage: t(actionData.errors.passwordConfirmation),
                }
              : { isInvalid: false, errorMessage: null })}
          />
          <Button type="submit" color="primary" size="lg">
            {t("recover.label")}
          </Button>
        </Form>
      )}
    </div>
  );
}
