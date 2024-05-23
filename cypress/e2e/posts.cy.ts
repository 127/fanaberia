/**
 * @description posts multilang check without authentication
 */
import i18n from "../../app/i18n";
import { t } from "../support/t";
// TODO: pagination test at index
// TODO: pagination test at categories
describe("posts multilang check without authentication", () => {
  i18n.supportedLngs.forEach((locale) => {
    it(`Post does not exist [${locale.toUpperCase()}]`, () => {
      // all 404 are the same and in English defined in root.tsx ErrorBoundary
      cy.visit(`/${locale}/posts/not-existing-page`, {
        failOnStatusCode: false,
      });
      cy.get('[data-testid="error-h1-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/");
      cy.get('[data-testid="error-p-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/")
        .should("contain.text", t("system.error.home"));
      cy.get("head title").should("have.text", "Oops!");
      cy.screenshot(`404-post-${locale}`);
    });

    it(`Category does not exist [${locale.toUpperCase()}]`, () => {
      // all 404 are the same and in English defined in root.tsx ErrorBoundary
      cy.visit(`/${locale}/posts/categories/not-existing-page`, {
        failOnStatusCode: false,
      });
      cy.get('[data-testid="error-h1-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/");
      cy.get('[data-testid="error-p-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/")
        .should("contain.text", t("system.error.home"));
      cy.get("head title").should("have.text", "Oops!");
      cy.screenshot(`404-category-${locale}`);
    });

    it(`Check locale change and categories menu at /${locale}/posts`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting
      cy.get("h1").should("be.visible").contains(t("nav.label.blog", locale));
      // should have categories menu
      cy.get('[data-testid="posts-aside-column"]')
        .should("be.visible")
        .contains(t("post.label.categories", locale));
      cy.screenshot(`posts-lc-change-to-${locale}`);
    });

    it(`Click random post CardHeader link and get to post at /${locale}/posts}`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting
      // let's click some random post
      cy.get('[data-testid="posts-card-header"] a').then(($links) => {
        const linkCount = $links.length;
        const randomIndex = Math.floor(Math.random() * linkCount);
        const slug = $links[randomIndex].getAttribute("href").split("/").pop();
        // cy.task("log", $links[randomIndex].getAttribute("href"));
        cy.wrap($links[randomIndex]).click();
        // should have categories menu
        cy.get('[data-testid="posts-aside-column"]')
          .should("be.visible")
          .contains(t("post.label.categories", locale));
        cy.screenshot(`random-post-${locale}`);

        // let's check if exact post is shown
        cy.task(
          "query",
          `SELECT p.*
          FROM posts as p
          LEFT JOIN categories as c ON c.id=p.category_id
          WHERE p.slug='${slug}' AND c.locale='${locale}'`
        ).then((post) => {
          // cy.task("log", slug);
          // cy.task("log", post[0]);
          const { title, keywords, description, heading } = post[0];
          cy.get("h1").should("be.visible").contains(heading);
          cy.get("head title").should("have.text", title);
          cy.get('meta[name="keywords"]').should(
            "have.attr",
            "content",
            keywords
          );
          cy.get('meta[name="description"]').should(
            "have.attr",
            "content",
            description
          );
        });
      });
    });

    it(`Click random post CardFooter link and get to categories at /${locale}/posts}`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting

      // let's click some  category in some random post card
      cy.get('[data-testid="posts-card-footer"] a').then(($links) => {
        const linkCount = $links.length;
        const randomIndex = Math.floor(Math.random() * linkCount);
        const slug = $links[randomIndex].getAttribute("href").split("/").pop();
        // cy.task("log", $links[randomIndex].getAttribute("href"));
        cy.wrap($links[randomIndex]).click();
        // should have categories menu
        cy.get('[data-testid="posts-aside-column"]')
          .should("be.visible")
          .contains(t("post.label.categories", locale));
        cy.screenshot(`random-post-category-${locale}`);

        // let's check if exact category page is shown
        cy.task(
          "query",
          `SELECT * FROM categories WHERE slug='${slug}' AND locale='${locale}'`
        ).then((category) => {
          const { title, keywords, description, heading } = category[0];
          cy.get("h1").should("be.visible").contains(heading);
          cy.get("head title").should("have.text", title);
          cy.get('meta[name="keywords"]').should(
            "have.attr",
            "content",
            keywords
          );
          cy.get('meta[name="description"]').should(
            "have.attr",
            "content",
            description
          );
        });
      });
    });

    it(`Click random category link in menu and get to categories at /${locale}/posts}`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting

      // let's click some category
      cy.get('[data-testid="categories-menu-list"] a').then(($links) => {
        const linkCount = $links.length;
        const randomIndex = Math.floor(Math.random() * linkCount);
        const slug = $links[randomIndex].getAttribute("href").split("/").pop();
        // cy.task("log", $links[randomIndex].getAttribute("href"));
        cy.wrap($links[randomIndex]).click();
        // should have categories menu
        cy.get('[data-testid="posts-aside-column"]')
          .should("be.visible")
          .contains(t("post.label.categories", locale));
        cy.screenshot(`random-category-${locale}`);

        // let's check if exact category page is shown
        cy.task(
          "query",
          `SELECT * FROM categories WHERE slug='${slug}' AND locale='${locale}'`
        ).then((category) => {
          const { title, keywords, description, heading } = category[0];
          cy.get("h1").should("be.visible").contains(heading);
          cy.get("head title").should("have.text", title);
          cy.get('meta[name="keywords"]').should(
            "have.attr",
            "content",
            keywords
          );
          cy.get('meta[name="description"]').should(
            "have.attr",
            "content",
            description
          );
        });
      });
    });

    it(`Click first category link in menu, then get first post from /${locale}/posts}`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting

      // let's click first category
      cy.get('[data-testid="categories-menu-list"] a')
        .first()
        .should("be.visible")
        .click();
      cy.screenshot(`first-category-${locale}`);

      // let's click first post
      cy.get('[data-testid="posts-card-header"] a')
        .first()
        .should("be.visible")
        .click()
        .then(($link) => {
          const slug = $link[0].getAttribute("href").split("/").pop();
          // cy.task("log", $links[randomIndex].getAttribute("href"));
          cy.screenshot(`random-category-post-${locale}`);

          // let's check if exact post is shown
          cy.task(
            "query",
            `SELECT p.*
          FROM posts as p
          LEFT JOIN categories as c ON c.id=p.category_id
          WHERE p.slug='${slug}' AND c.locale='${locale}'`
          ).then((post) => {
            // cy.task("log", slug);
            // cy.task("log", post[0]);
            const { title, keywords, description, heading } = post[0];
            cy.get("h1").should("be.visible").contains(heading);
            cy.get("head title").should("have.text", title);
            cy.get('meta[name="keywords"]').should(
              "have.attr",
              "content",
              keywords
            );
            cy.get('meta[name="description"]').should(
              "have.attr",
              "content",
              description
            );
          });
        });
    });

    it(`Check pagination at /${locale}/posts`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting
      //get second page
      cy.get('[data-testid="posts-pagination"] li')
        .eq(1)
        .should("be.visible")
        .click();
      // should have categories menu
      cy.get('[data-testid="posts-aside-column"]')
        .should("be.visible")
        .contains(t("post.label.categories", locale));
      cy.screenshot(`posts-pagination-${locale}`);
      // let's click first post
      cy.get('[data-testid="posts-card-header"] a')
        .first()
        .should("be.visible")
        .click()
        .then(($link) => {
          const slug = $link[0].getAttribute("href").split("/").pop();
          // cy.task("log", $links[randomIndex].getAttribute("href"));
          cy.screenshot(`posts-pagination-post-${locale}`);

          // let's check if exact post is shown
          cy.task(
            "query",
            `SELECT p.*
  FROM posts as p
  LEFT JOIN categories as c ON c.id=p.category_id
  WHERE p.slug='${slug}' AND c.locale='${locale}'`
          ).then((post) => {
            // cy.task("log", slug);
            // cy.task("log", post[0]);
            const { title, keywords, description, heading } = post[0];
            cy.get("h1").should("be.visible").contains(heading);
            cy.get("head title").should("have.text", title);
            cy.get('meta[name="keywords"]').should(
              "have.attr",
              "content",
              keywords
            );
            cy.get('meta[name="description"]').should(
              "have.attr",
              "content",
              description
            );
          });
        });
    });

    it(`Check pagination at /${locale}/posts/categories/:category`, () => {
      cy.visit(`/${locale}/posts`).wait(50);
      cy.changeLocale(locale).wait(200); // will fail without waiting
      // let's click first category
      cy.get('[data-testid="categories-menu-list"] a')
        .first()
        .should("be.visible")
        .click();

      //get second page
      cy.get('[data-testid="posts-pagination"] li')
        .eq(1)
        .should("be.visible")
        .click();
      // should have categories menu
      cy.get('[data-testid="posts-aside-column"]')
        .should("be.visible")
        .contains(t("post.label.categories", locale));
      cy.screenshot(`posts-pagination-category-${locale}`);
      // let's click first post
      cy.get('[data-testid="posts-card-header"] a')
        .first()
        .should("be.visible")
        .click()
        .then(($link) => {
          const slug = $link[0].getAttribute("href").split("/").pop();
          // cy.task("log", $links[randomIndex].getAttribute("href"));
          cy.screenshot(`posts-pagination-category-post-${locale}`);

          // let's check if exact post is shown
          cy.task(
            "query",
            `SELECT p.*
  FROM posts as p
  LEFT JOIN categories as c ON c.id=p.category_id
  WHERE p.slug='${slug}' AND c.locale='${locale}'`
          ).then((post) => {
            // cy.task("log", slug);
            // cy.task("log", post[0]);
            const { title, keywords, description, heading } = post[0];
            cy.get("h1").should("be.visible").contains(heading);
            cy.get("head title").should("have.text", title);
            cy.get('meta[name="keywords"]').should(
              "have.attr",
              "content",
              keywords
            );
            cy.get('meta[name="description"]').should(
              "have.attr",
              "content",
              description
            );
          });
        });
    });
  });
});
