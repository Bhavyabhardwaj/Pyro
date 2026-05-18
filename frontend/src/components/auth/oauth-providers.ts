export type OAuthProviderId = "google" | "github";

export interface OAuthProvider {
  id: OAuthProviderId;
  label: string;
  accent: string;
  mark: string;
}

export const oauthProviders: OAuthProvider[] = [
  {
    id: "google",
    label: "Continue with Google",
    accent: "from-sky-300/20 via-white/10 to-rose-300/20",
    mark: "G",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    accent: "from-zinc-200/16 via-white/10 to-zinc-500/16",
    mark: "GH",
  },
];
