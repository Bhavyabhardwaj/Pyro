import { AuthDivider } from "./AuthDivider";
import { OAuthButton } from "./OAuthButton";
import { oauthProviders, type OAuthProvider } from "./oauth-providers";

export function OAuthOptions({
  onProviderSelect,
}: {
  onProviderSelect: (provider: OAuthProvider) => void;
}) {
  return (
    <>
      <div className="grid gap-3">
        {oauthProviders.map((provider) => (
          <OAuthButton
            key={provider.id}
            provider={provider}
            onClick={onProviderSelect}
          />
        ))}
      </div>
      <AuthDivider />
    </>
  );
}
