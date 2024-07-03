import { Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18next.server';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request);
  return json(
    {
      meta: {
        title: t('meta.title'),
        description: t('meta.description'),
        keywords: t('meta.keywords'),
      },
    },
    { status: 404 },
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: 'description', content: data?.meta.description },
    { name: 'keywords', content: data?.meta.keywords },
  ];
};

// export const loader = async () => json(null, { status: 404 });

export default function NotExistingRootLevelRoute() {
  const { t } = useTranslation('common');
  return (
    <>
      <h1 className="font-bold text-2xl">{t('system.error.404')}</h1>
      <p className="py-5">
        <Link to="/" className="underline" data-testid="link-home-404">
          {t('system.error.home')} &rarr;
        </Link>
      </p>
    </>
  );
}
