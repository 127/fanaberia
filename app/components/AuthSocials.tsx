import { Form } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
// import { AppleLogo } from "~/assets/AppleLogo";
// import { FaceBookLogo } from "~/assets/FaceBookLogo";
import { GoogleLogo } from "~/assets/GoogleLogo";

interface LogoComponents {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
const Logos: LogoComponents = {
  // apple: AppleLogo,
  // facebook: FaceBookLogo,
  google: GoogleLogo,
};

interface SocialButtonProps {
  provider: SocialsProvider;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
}: {
  provider: string;
}) => {
  const LogoComponent = Logos[provider.toLowerCase()];
  return (
    <Form action={`/auth/${provider}`} method="post">
      <button type="submit" className={"oauth-" + provider}>
        <LogoComponent
          style={{ borderRadius: "10px", width: "56px", height: "56px" }}
        />
      </button>
    </Form>
  );
};

interface OauthLinksPanelProps {
  className?: string;
  id?: string;
}

export const OauthLinksPanel = (props: OauthLinksPanelProps) => (
  <div {...props}>
    <SocialButton provider={SocialsProvider.GOOGLE} />
    {/* <SocialButton provider={SocialsProvider.FACEBOOK} /> */}
    {/* <SocialButton provider={"apple" as SocialsProvider} /> */}
  </div>
);
