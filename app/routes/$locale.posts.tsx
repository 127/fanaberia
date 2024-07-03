// IMPORTANT: meta for this file in $locale.posts_index.tsx
import { Link, Outlet, json, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/node';
import { getCategories } from '~/models/category.server';
import { useTranslation } from 'react-i18next';

export async function loader({ params }: LoaderFunctionArgs) {
  const categories = await getCategories(params.locale);
  if (categories.length === 0) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ categories });
}

export default function Posts() {
  const { t, i18n } = useTranslation('common');
  const { categories } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <section className="w-full md:w-3/4">
        <Outlet />
      </section>
      <aside className="w-full md:w-1/4" data-testid="posts-aside-column">
        <h2 className="font-bold text-xl mb-6 ml-6">
          {t('post.label.categories')}
        </h2>
        <ul className="ml-6" data-testid="categories-menu-list">
          {categories.map((category) => (
            <li key={category.id} className="leading-8">
              <Link to={`/${i18n.language}/posts/categories/${category.slug}`}>
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
