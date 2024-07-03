import { Category, Page, Post, PostTag, PrismaClient } from '@prisma/client';
import { allFakers } from '@faker-js/faker';
import { generateToken } from '~/utils/utils.server';
import bcrypt from 'bcryptjs';
import i18n from '~/i18n';

const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
const defaultLocale = i18n.supportedLngs[0] as keyof typeof allFakers;
const prisma = new PrismaClient();

const INFO_PAGES = ['support', 'contacts', 'privacy', 'terms', 'faq'];

async function seed() {
  const email = 'confirmed@domain.test';

  // // cleanup the existing database
  // await prisma.user.delete({ where: { email } }).catch(() => {
  //   // no worries if it doesn't exist yet
  // });

  const hashedPassword = await bcrypt.hash('123321123aA', 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      confirmed_at: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      email: 'confirmed-to-recover@domain.test',
      password: hashedPassword,
      confirmed_at: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      email: 'unconfirmed@domain.test',
      password: hashedPassword,
      confirmation_token: generateToken(64),
    },
  });

  // Создаем несколько администраторов
  // const admins =
  await Promise.all([
    prisma.admin.create({
      data: {
        email: 'admin1@example.com',
        password: hashedPassword,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'admin2@example.com',
        password: hashedPassword,
      },
    }),
  ]);

  const categoryPromises: Promise<Category>[] = [];
  const postPromises: Promise<Post>[] = [];

  for (let i = 0; i < 10; i++) {
    i18n.supportedLngs.map((locale) => {
      const lc = locale as keyof typeof allFakers;
      const categoryPromise = prisma.category.create({
        data: {
          name: capitalizeFirstLetter(allFakers[lc].commerce.department()),
          slug: allFakers['en'].lorem.slug(),
          title: allFakers[lc].lorem.sentence(),
          keywords: allFakers[lc].lorem.words(),
          description: allFakers[lc].lorem.paragraph(),
          heading: allFakers[lc].lorem.sentence(),
          locale,
        },
      });
      categoryPromises.push(categoryPromise);
      categoryPromise.then((category: Category) => {
        const lc = category.locale as keyof typeof allFakers;
        // 20 articles at each categgory
        for (let i = 0; i < 20; i++) {
          postPromises.push(
            prisma.post.create({
              data: {
                slug: allFakers['en'].lorem.slug(),
                title: allFakers[lc].lorem.sentence(),
                keywords: allFakers[lc].lorem.words(),
                description: allFakers[lc].lorem.paragraph(),
                summary: allFakers[lc].lorem.paragraph(),
                heading: allFakers[lc].lorem.sentence(),
                content: allFakers[lc].lorem.paragraphs(4),
                category_id: category.id,
              },
            }),
          );
        }
      });
    });
  }
  await Promise.all(categoryPromises);
  const posts = await Promise.all(postPromises);

  const tagPromises = [];

  for (let i = 0; i < 50; i++) {
    tagPromises.push(
      prisma.tag.create({
        data: {
          name: allFakers[defaultLocale].lorem.word(),
          slug: allFakers[defaultLocale].lorem.slug(),
          title: allFakers[defaultLocale].lorem.sentence(),
          keywords: allFakers[defaultLocale].lorem.words(),
          description: allFakers[defaultLocale].lorem.paragraph(),
          heading: allFakers[defaultLocale].lorem.sentence(),
        },
      }),
    );
  }

  const tags = await Promise.all(tagPromises);

  const postTagPromises: Promise<PostTag>[] = [];
  posts.forEach((post) => {
    const usedTagIds = new Set<number>();
    const numberOfTags = allFakers[defaultLocale].number.int({
      min: 1,
      max: 3,
    });

    for (let i = 0; i < numberOfTags; i++) {
      let tagId;
      do {
        tagId =
          tags[
            allFakers[defaultLocale].number.int({
              min: 0,
              max: tags.length - 1,
            })
          ].id;
      } while (usedTagIds.has(tagId)); // Повторять, пока не найдем неиспользованный тег

      usedTagIds.add(tagId);

      postTagPromises.push(
        prisma.postTag.create({
          data: {
            post_id: post.id,
            tag_id: tagId,
          },
        }),
      );
    }
  });
  await Promise.all(postTagPromises);

  const infoPagePromises: Promise<Page>[] = [];
  INFO_PAGES.map((slug) => {
    i18n.supportedLngs.map((locale) => {
      const lc = locale as keyof typeof allFakers;
      const pagePromise = prisma.page.create({
        data: {
          name: allFakers[lc].company.catchPhrase(),
          slug,
          title: allFakers[lc].lorem.sentence(),
          keywords: allFakers[lc].lorem.words(3),
          description: allFakers[lc].lorem.paragraph(),
          heading: allFakers[lc].lorem.sentence(),
          content: allFakers[lc].lorem.paragraphs(10),
          locale,
        },
      });
      infoPagePromises.push(pagePromise);
    });
  });
  await Promise.all(infoPagePromises);

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
