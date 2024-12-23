"use client";

import Link from "next/link";
import UserAuthForm from "@/components/forms/user-auth-form";
import { useState, useEffect } from "react";
import AuthLayout, { fetchEntityData } from "../side-component";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

interface EntityData {
  previewLogo?: string;
  previewTitle?: string;
  mode?: string;
}

export default function Page() {
  // Router and session hooks for navigation and authentication handling
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations(); // Translations hook

  // Retrieve query parameters for client ID, access ID, and redirect URI
  const clientId = (searchParams?.get('client_id') as string) || '';
  const accessId = (searchParams?.get('access_id') as string) || '';

  // State to manage fetched entity data and checkbox status
  const [entityData, setEntityData] = useState<EntityData | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Redirect if clientId is missing
  if (!clientId) return <p>{t('Client id is missing')}</p>;

  const queryParamString = searchParams?.toString() ?? '';
  const onLoginSuccess = `/connect?${queryParamString}`;

  // Fetch and set entity data based on client and access IDs
  useEffect(() => {
    if (clientId) {
      fetchEntityData(clientId, accessId).then(data => {
        setEntityData(data);
      });
    }
  }, [clientId, accessId, t, router]);

  // Handle checkbox state change for "start from scratch" option
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <AuthLayout entityData={entityData}>
      <div className="p-4 lg:p-8 flex items-center">
        <div className="mx-auto flex flex-col space-y-6 w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signIn')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.connectWithEartho2')}<br />{t('auth.becomeUndetectable')}
            </p>
          </div>
          {/* Authentication form with redirect URL */}
          <UserAuthForm redirectUri={onLoginSuccess} />
          <div className="px-8 text-center text-sm text-muted-foreground">
            <label className="flex items-centeסr justify-center space-x-2">
              <Checkbox
                checked={isChecked}
                onCheckedChange={handleCheckboxChange}
              />
              <span>{t('auth.beginFromScratch')}</span>
            </label>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            {t('auth.agreeToTerms')}{" "}
            <Link
              href="https://www.eartho.io/legal/terms-of-service"
              className="underline underline-offset-4 hover:text-primary"
            >
              <br />{t('auth.termsOfService')}
            </Link>{" "}
            {t('auth.and')}{" "}
            <Link
              href="https://www.eartho.io/legal/privacy-policy"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t('auth.privacyPolicy')}
            </Link>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
