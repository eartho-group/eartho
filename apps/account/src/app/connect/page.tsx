import { auth } from "@/auth";
import { createOidcProvider } from "@/lib/oidc";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const oidc = createOidcProvider();

// app/connect/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] };
}) {
  const headersList = headers()
  const host = headersList.get('host');

  const redirectUri = searchParams.redirect_uri || '';
  const clientId = searchParams.client_id || '';

  if (!clientId || !redirectUri) {
    redirect('/');
    return
  }

  redirect('/api/oidc');
  return (<div></div>);
}
