import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TravelPlan } from '@/products/ui/travel-plan';

export default function TripScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('travel.title') }} />
      <TravelPlan onOpenProduct={(id) => router.push(`/products/${id}`)} />
    </>
  );
}
