'use client';

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import ApprovalComponent from "./approval";
import AuthLayout, { EntityData, fetchEntityData } from "../side-component";
import { useTranslations } from 'next-intl';


export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams() ;
  const [entityData, setEntityData] = useState<EntityData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const t = useTranslations('auth');

  useEffect(() => {

    const clientId = searchParams?.get('client_id');
    const accessId = searchParams?.get('access_id');
    const redirectUri = searchParams?.get('redirect_uri');

    const fetchData = async () => {
      try {
        if (!clientId) return;
        const data = await fetchEntityData(clientId, accessId);
        setEntityData(data);
      } catch (error) {
        console.error("Failed to fetch entity data", error);
        setErrorMessage('Failed to fetch entity data.');
      }
    };

    fetchData();
  }, [searchParams, router]);


  if (errorMessage) {
    return (
      <AuthLayout entityData={null}>
        <div className="p-4 lg:p-8 h-full flex items-center justify-center">
          <div className="text-center text-red-500">
            {errorMessage}
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout entityData={entityData}>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex flex-col space-y-6 w-full max-w-[350px]">
          <ApprovalComponent />
          <p
            className="px-8 text-center text-sm text-muted-foreground underline cursor-pointer"
            // onClick={() =>
            //   signOut({ redirect: false })
            // }
          >
            {/* {t('signOut')} */}
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
