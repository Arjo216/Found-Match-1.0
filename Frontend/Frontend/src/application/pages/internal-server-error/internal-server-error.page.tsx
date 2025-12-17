import { Button } from '@mui/material';
// import { NextSeo } from 'next-seo'; // Removed as NextSeo is not exported
import { useRouter } from 'next/router';
import { useDeviceDetect } from 'use-device-detect';

import { Error } from '@domain';

import { useTranslation } from '@utils';

import { ERoutes } from '@enums';

import { translationStrings } from './internal-server-error.defaults';
import { JSX } from 'react';

export const InternalServerErrorPage = (): JSX.Element => {
  const router = useRouter();
  const { deviceData } = useDeviceDetect();
  const translations = useTranslation(translationStrings);

  const backToHome = () => router.push(ERoutes.DASHBOARD);

  return (
    <Error code="500" message={translations.errorPageInternalServerErrorMessage}>
      {/* Removed NextSeo as it is not exported */}
      <Button
        color="info"
        size={deviceData.isSmallerThanXS ? 'medium' : 'large'}
        variant="contained"
        onClick={backToHome}
      >
        {translations.errorPageInternalServerErrorBackToHomepageButton}
      </Button>
    </Error>
  );
};
