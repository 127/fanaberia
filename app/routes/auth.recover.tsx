import { Button, Card, CardBody, Input } from '@nextui-org/react';
import { Form, useActionData } from '@remix-run/react';
import { generateEmailHtml } from '~/templates/generateEmailHtml';
import { json } from '@remix-run/node';
import { sendEmail } from '../utils/utils.server';
import {
  setPasswordRecoveryToken,
  userExistsAndPasswordIsRecoverable,
} from '~/models/user.server';
import { transporter } from '~/../cypress/emailer';
import { useTranslation } from 'react-i18next';
import i18next from '../i18next.server';
import passwordRecoveryValidationSchema from '~/validators/passwordRecoveryValidationSchema';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';

export const action = async ({ request }: ActionFunctionArgs) => {
  const t = await i18next.getFixedT(request, 'common');
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);

  try {
    await passwordRecoveryValidationSchema.validate(formObj, {
      abortEarly: false,
    });
  } catch (err) {
    // on error always return success to prevent email enumeration
    return json({ success: true });
  }

  const email = formData.get('email') as string;
  if (await userExistsAndPasswordIsRecoverable(email)) {
    const token = await setPasswordRecoveryToken(email);
    const host = request.headers.get('host');
    const proto = request.headers.get('X-Forwarded-Proto') || 'http';
    const link = `${proto}://${host}/auth/recovered/${token}`;
    const body = t('sign.up.email.recovery.text').replace(
      /{{link}}/g,
      `<a href="${link}">${t('recover.email.link.theme')}</a>`,
    );

    const htmlEmail = generateEmailHtml({
      brand: t('brand'),
      slogan: t('slogan'),
      body,
      warning: t('common.email.warning'),
    });
    // console.log('setPasswordRecoveryToken', token);
    if (process.env.NODE_ENV === 'production') {
      try {
        await sendEmail(email, t('sign.up.email.recovery.theme'), htmlEmail);
      } catch (e) {
        console.log('sendEmail pass recover error: ', JSON.stringify(e));
      }
    } else {
      try {
        // send email for auto testing
        transporter.sendMail({
          from: '"Fanaberia autotesting" <testing@fanaberia.io>',
          to: email,
          subject: t('sign.up.email.recovery.theme'),
          html: htmlEmail,
        });
      } catch (e) {
        console.log(
          'Testing transporter.sendMail pass recover error: ',
          JSON.stringify(e),
        );
      }
    }
  }
  return json({ success: true });
};
export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(request, 'common');
  return json({
    meta: {
      title: t('meta.auth.recover.title'),
      description: t('meta.auth.recover.description'),
      keywords: t('meta.auth.recover.keywords'),
    },
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.meta.title },
    { name: 'description', content: data?.meta.description },
    { name: 'keywords', content: data?.meta.keywords },
  ];
};

export default function Recover() {
  const actionData = useActionData<typeof action>();
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-4 mx-auto w-full md:w-2/3 lg:w-1/4">
      <h1 className="flex w-full flex-col">{t('recover.heading')}</h1>
      {actionData?.success ? (
        <Card className="flex gap-4 bg-success-200" key="recover-inited">
          <CardBody>{t('recover.inited')}</CardBody>
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
            description={t('recover.hint')}
          />
          <Button type="submit" color="primary" size="lg" data-testid="submit">
            {t('recover.label')}
          </Button>
        </Form>
      )}
    </div>
  );
}
