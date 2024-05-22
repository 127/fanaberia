import { useLocation } from "@remix-run/react";
import { AUTHORIZED_ADMIN_INDEX } from "~/utils/utils.common";

type MetaIconsLinksProps = {
  env: "development" | "production" | "test";
};
const MetaIconsLinks = ({ env }: MetaIconsLinksProps): JSX.Element => {
  const location = useLocation();
  const isWarp = location.pathname.startsWith(AUTHORIZED_ADMIN_INDEX);
  // console.log("Current environment: ", env);
  return (
    <>
      {env === "production" && !isWarp ? (
        <>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_ID"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              <!--GOOGLE TAG CODE  HERE-->
          `,
            }}
          ></script>
        </>
      ) : null}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </>
  );
};
export default MetaIconsLinks;
