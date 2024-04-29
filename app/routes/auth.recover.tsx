import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import {
  userExistsAndPasswordIsRecoverable,
  setPasswordRecoveryToken,
} from "~/models/user.server";
import { sendEmail } from "../utils/utils.server";
import { ValidationError } from "yup";
import i18next from "../i18next.server";
import passwordRecoveryValidationSchema from "~/validators/passwordRecoveryValidationSchema";
import { generateEmailHtml } from "~/templates/generateEmailHtml";

export const action = async ({ request }: ActionFunctionArgs) => {
  const t = await i18next.getFixedT(request, "common");
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);
  const validationResult = await passwordRecoveryValidationSchema()
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

  // on errors always return success
  if (validationResult !== formObj) {
    return json({ success: true });
  }

  const email = formData.get("email") as string;
  if (await userExistsAndPasswordIsRecoverable(email)) {
    const token = await setPasswordRecoveryToken(email);
    const host = request.headers.get("host");
    const proto = request.headers.get("X-Forwarded-Proto") || "http";
    const link = `${proto}://${host}/auth/recovered-reset?token=${token}`;
    // console.log('setPasswordRecoveryToken', token);
    try {
      await sendEmail(
        email,
        t("sign.up.email.recovery.theme"),
        generateEmailHtml({
          brand: t("brand"),
          slogan: t("slogan"),
          body: t("sign.up.email.recovery.text", { link }),
          warning: t("common.email.warning"),
        })
      );
    } catch (e) {
      console.log("sendEmail error: ", JSON.stringify(e));
    }
  }
  return json({ success: true });
};
export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(request, "common");
  return json({
    meta: {
      title: t("meta.auth.recover.title"),
      description: t("meta.auth.recover.description"),
      keywords: t("meta.auth.recover.keywords"),
    },
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: "description", content: data?.meta.description },
    { name: "keywords", content: data?.meta.keywords },
  ];
};

export default function Recover() {
  const actionData = useActionData<typeof action>();
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">{t("recover.heading")}</h1>
      {actionData?.success ? (
        <Card className="flex gap-4 bg-success-200" key="recover-inited">
          <CardBody>{t("recover.inited")}</CardBody>
        </Card>
      ) : (
        <Form method="post" className="flex w-full flex-col mb-4 gap-4">
          <Input
            isRequired
            type="text"
            label="Email"
            name="email"
            variant="bordered"
            autoComplete="username email"
            description={t("recover.hint")}
          />
          <Button type="submit" color="primary" size="lg">
            {t("recover.label")}
          </Button>
        </Form>
      )}
    </div>
  );
}
