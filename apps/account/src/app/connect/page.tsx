import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[]>;
}) {
  const host = headers().get('host');
  const session = await auth();
  const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();

  if (!searchParams.client_id) return "Client id is missing";

  if (session?.accessToken) {
    return redirect(`/connect/consent?${queryString}`);
  } else {
    return redirect(`/connect/login?${queryString}`);
  }
}
