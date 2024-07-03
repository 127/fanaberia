import * as yup from 'yup';
import { Button, Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { PostData, getPostById, updatePost } from '~/models/post.server';
import { authenticateUserByRole } from '~/utils/utils.server';
import { capitalizeFirstLetter } from '~/utils/utils.common';
import { getCategories } from '~/models/category.server';
import { json, redirect } from '@remix-run/node';
import { useEffect, useState } from 'react';
import postValidaionSchema from '~/validators/postValidationSchema';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }
  const post = await getPostById(Number(params.id));
  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }
  const categories = await getCategories();
  return json({ post, categories });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticateUserByRole(request, 'admin');
  const formData = await request.formData();

  const fields: PostData = {
    slug: formData.get('slug') as string,
    title: formData.get('title') as string,
    keywords: formData.get('keywords') as string,
    description: formData.get('description') as string,
    heading: formData.get('heading') as string,
    summary: formData.get('summary') as string,
    content: formData.get('content') as string,
    picture: formData.get('picture') as string,
    category_id: Number(formData.get('category_id')),
  };

  try {
    await postValidaionSchema.validate(fields, { abortEarly: false });
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
    await updatePost(Number(params.id), fields);
    return redirect(`/warp/posts/${params.id}/show`);
  } catch (error) {
    return json({ errors: { common: 'DB error' }, fields });
  }
};

const inputs = 'slug,title,keywords,description,heading,picture'.split(',');
const textareas = 'summary,content'.split(',');

export default function WarpPostsEdit() {
  const { post, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [values, setValues] = useState<PostData>(post as PostData);
  const [errors, setErrors] = useState(actionData?.errors);

  const handleChange = (name: string, value: string) => {
    setValues((prevValues) => ({ ...(prevValues as PostData), [name]: value }));

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
      <h1 className="font-bold text-lg">Edit post</h1>
      <Button as={Link} color="primary" className="w-12" to="/warp/posts">
        Back
      </Button>
      <Form method="post" className="flex w-full flex-col mb-4 gap-4">
        <Select
          isRequired
          name="category_id"
          label="Category"
          selectionMode="single"
          defaultSelectedKeys={[values?.category_id ?? categories[0].id]}>
          {categories.map((category) => (
            <SelectItem
              key={String(category.id)}
              value={category.id}
              textValue={`${category.locale} — ${category.name}`}>
              {category.locale} — {category.name}
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
            value={values?.[name as keyof typeof values] as string}
            onChange={(e) => handleChange(name, e.target.value)}
            {...(errors && errors[name as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage: errors[name as keyof typeof errors],
                }
              : {})}
          />
        ))}

        {textareas.map((name) => (
          <Textarea
            key={`textarea-${name}`}
            isRequired
            id={name}
            name={name}
            label={capitalizeFirstLetter(name)}
            className="w-full"
            value={(values?.[name as keyof typeof values] as string) ?? ''}
            onChange={(e) => handleChange(name, e.target.value)}
            {...(errors && errors[name as keyof typeof errors]
              ? {
                  isInvalid: true,
                  errorMessage: errors[name as keyof typeof errors],
                }
              : {})}
          />
        ))}
        <p>Created at: {new Date(post.created_at).toUTCString()}</p>
        <p>Updated at: {new Date(post.updated_at).toUTCString()}</p>
        <Button type="submit" color="primary" size="lg">
          save
        </Button>
      </Form>
    </div>
  );
}
