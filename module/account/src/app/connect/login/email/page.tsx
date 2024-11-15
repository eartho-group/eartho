'use client';

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLayout, { EntityData, fetchEntityData } from "../../side-component";
import UserEmailAuthForm from "@/components/forms/user-email-auth-form";
import { useTranslations } from 'next-intl';
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [entityData, setEntityData] = useState<EntityData | null>(null);
  const t = useTranslations('auth'); // Use the useTranslations hook

  const clientId = searchParams?.get('client_id');
  const accessId = searchParams?.get('access_id');
  const interactionId = searchParams?.get('interaction'); // Adjust to actual query param name if needed

  // Get session data from next-auth
  const { data: session } = useSession();

  useEffect(() => {

    if (!clientId) {
      console.error("Client id is missing");
      return;
    }

    const fetchData = async () => {
      const data = await fetchEntityData(clientId, accessId);
      setEntityData(data);
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (session?.accessToken) {
      const queryParamString = searchParams?.toString() ?? '';
      router.push(`/connect/consent?${queryParamString}`);
    }
  }, [session?.accessToken]);



  return (
    <AuthLayout entityData={entityData}>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex flex-col space-y-6 w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{t('signIn')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('enterEmailToReceive')}<br />{t('oneTimePassQuickLoginEmail')}
            </p>
          </div>
          <UserEmailAuthForm />
          <div>
            <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
              {t('agreeToTerms')}{" "}
              <Link
                href="https://www.eartho.io/legal/terms-of-service"
                className="underline underline-offset-4 hover:text-primary"
              >
                <br />{t('termsOfService')}
              </Link>{" "}
              {t('and')}{" "}
              <Link
                href="https://www.eartho.io/legal/privacy-policy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('privacyPolicy')}
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
