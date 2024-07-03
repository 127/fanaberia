import * as yup from 'yup';
import { Button, Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { PageData, getPageById, updatePage } from '~/models/page.server';
import { authenticateUserByRole } from '~/utils/utils.server';
import { capitalizeFirstLetter } from '~/utils/utils.common';
import { json, redirect } from '@remix-run/node';
import { useEffect, useState } from 'react';
import i18n from '~/i18n';
import pageValidaionSchema from '~/validators/pageValidationSchema';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }
  const page = await getPageById(Number(params.id));
  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }
  const locales = i18n.supportedLngs.map((locale) => ({
    label: capitalizeFirstLetter(locale),
    value: locale,
  }));
  return json({ page, locales });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  const formData = await request.formData();

  const fields: PageData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    title: formData.get('title') as string,
    keywords: formData.get('keywords') as string,
    description: formData.get('description') as string,
    heading: formData.get('heading') as string,
    locale: formData.get('locale') as string,
    content: formData.get('content') as string,
  };

  try {
    await pageValidaionSchema.validate(fields, { abortEarly: false });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, error) => ({
          ...acc,
          [String(error.path)]: error.message,
        }),
        {},
      );
      // console.log(errors);
      return json({ errors, fields });
    }
    // Handle unexpected errors
    throw err;
  }
  try {
    // console.log("fields", fields);
    await updatePage(Number(params.id), fields);
    return redirect(`/warp/pages/${params.id}/show`);
  } catch (error) {
    return json({ errors: { common: 'DB error' }, fields });
  }
};

const inputs = 'name,slug,title,keywords,description,heading'.split(',');
export default function WarpPagesEdit() {
  const { page, locales } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [values, setValues] = useState<PageData>(page);
  const [errors, setErrors] = useState(actionData?.errors);

  const handleChange = (name: string, value: string) => {
    setValues((prevValues) => ({ ...(prevValues as PageData), [name]: value }));

    if (errors?.[name as keyof typeof errors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };
  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
    if (actionData?.fields) {
      setValues(actionData.fields);
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-4 mx-auto w-full">
      <h1 className="font-bold text-lg">Edit page</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/pages">
        Back
      </Button>

      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        <Select
          isRequired
          name="locale"
          label="Locale"
          selectionMode="single"
          defaultSelectedKeys={[values?.locale]}>
          {locales.map((locale) => (
            <SelectItem key={locale.value} value={locale.value}>
              {locale.label}
            </SelectItem>
          ))}
        </Select>
        {inputs.map((name) => (
          <Input
            key={`input-${name}`}
            isRequired
            id={name}
            name={name}
            label={name}
            type="text"
            className="w-full"
            value={values?.[name as keyof typeof values]}
            onChange={(e) => handleChange(name, e.target.value)}
            {...(errors && errors[name as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage: errors[name as keyof typeof errors],
                }
              : {})}
          />
        ))}
        <Textarea
          isRequired
          id="content"
          name="content"
          label="content"
          type="text"
          className="w-full"
          value={values?.['content' as keyof typeof values]}
          onChange={(e) => handleChange('content', e.target.value)}
          {...(errors && errors['content' as keyof typeof errors]
            ? {
                isInvalid: true,
                errorMessage: errors['content' as keyof typeof errors],
              }
            : {})}
        />
        <p>Created at: {new Date(page.created_at).toUTCString()}</p>
        <p>Updated at: {new Date(page.updated_at).toUTCString()}</p>
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
