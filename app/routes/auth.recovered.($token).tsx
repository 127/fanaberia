import * as yup from 'yup';
import { AUTHENTICATION_FAILURE_PATHS } from '~/utils/utils.common';
import { Button, Card, CardBody, Input } from '@nextui-org/react';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { resetPassword, userIsRecovering } from '~/models/user.server';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18next.server';
import passwordRecoveredValidationSchema from '~/validators/passwordRecoveredValidationSchema';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';

type ResetPasswordResponse = {
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  errors?: {
    message?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    terms?: string;
  };
  fields?: {
    password?: string;
    passwordConfirmation?: string;
  };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, 'common');
  const meta = {
    title: t('meta.auth.recovered-reset.title'),
    description: t('meta.auth.recovered-reset.description'),
    keywords: t('meta.auth.recovered-reset.keywords'),
  };
  if (!params.token || !(await userIsRecovering(params.token))) {
    return json<ResetPasswordResponse>(
      { meta, errors: { message: t('recover.reset.impossible') } },
      { status: 403 },
    );
  }
  return json<ResetPasswordResponse>({ meta });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const t = await i18next.getFixedT(request, 'common');
  if (!params.token || !(await userIsRecovering(params.token))) {
    return json<ResetPasswordResponse>(
      { errors: { message: t('recover.reset.impossible') } },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const fields: ResetPasswordResponse['fields'] = {
    password: formData.get('password') as string,
    passwordConfirmation: formData.get('passwordConfirmation') as string,
  };

  try {
    await passwordRecoveredValidationSchema.validate(fields, {
      abortEarly: false,
    });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, error) => ({
          ...acc,
          [String(error.path)]: t(error.message),
        }),
        {},
      );
      return json({ errors, fields }, 400);
    }
    throw err;
  }
  await resetPassword(params.token, fields.password as string);
  return redirect(`${AUTHENTICATION_FAILURE_PATHS.user}?recovered=true`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta?.title },
    { name: 'description', content: data?.meta?.description },
    { name: 'keywords', content: data?.meta?.keywords },
  ];
};

export default function RecoveredToken() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { t } = useTranslation('common');
  const [values, setValues] = useState<ResetPasswordResponse['fields']>();
  const [errors, setErrors] = useState(actionData?.errors);

  const handleChange = (name: string, value: string) => {
    // console.log(name, value);
    setValues((prevValues) => ({
      ...(prevValues as ResetPasswordResponse['fields']),
      [name]: value,
    }));

    if (errors?.[name as keyof typeof errors]) {
      setErrors((prevErrors: { [key: string]: string }) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
    if (loaderData.errors) {
      setErrors(loaderData.errors);
    }
    if (actionData?.fields) {
      setValues(actionData.fields);
    }
  }, [actionData, loaderData]);

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">{t('recover.heading')}</h1>
      {errors && errors['message' as keyof typeof errors] ? (
        <Card className="flex gap-4 bg-success-200" key="recover-inited">
          <CardBody>{errors['message' as keyof typeof values]}</CardBody>
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
            value={values?.['password' as keyof typeof values] as string}
            onChange={(e) => handleChange('password', e.target.value)}
            {...(errors && errors['password' as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage: errors['password' as keyof typeof errors],
                }
              : {})}
          />
          <Input
            isRequired
            label="Confirm password"
            type="password"
            name="passwordConfirmation"
            variant="bordered"
            autoComplete="new-password"
            value={
              values?.['passwordConfirmation' as keyof typeof values] as string
            }
            onChange={(e) =>
              handleChange('passwordConfirmation', e.target.value)
            }
            {...(errors && errors['passwordConfirmation' as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage:
                    errors['passwordConfirmation' as keyof typeof errors],
                }
              : {})}
          />
          <Button type="submit" color="primary" size="lg" data-testid="submit">
            {t('recover.label')}
          </Button>
        </Form>
      )}
    </div>
  );
}
