import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import type { TimelineMark, TodayDose } from '@/doses/dose-service';
import { DoseActionButton } from '@/doses/ui/dose-action-button';
import { meadowSlot, SCENE_HEIGHT } from '@/scene/scene-service';

const POPUP_MAX_WIDTH = 280;
const POPUP_MARGIN = 12;
const POPUP_RISE = 44;
const MAX_ROWS = 5;

type Props = {
  mark: TimelineMark;
  index: number;
  canTake: boolean;
  onTake: (dose: TodayDose) => void;
};

export function MeadowPopup({ mark, index, canTake, onTake }: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const popupWidth = Math.min(POPUP_MAX_WIDTH, width - 2 * POPUP_MARGIN);
  const { x, y } = meadowSlot(mark.position, index, width);
  const left = Math.min(
    width - POPUP_MARGIN - popupWidth,
    Math.max(POPUP_MARGIN, x - popupWidth / 2),
  );
  const rows = pendingFirst(mark.doses);

  return (
    <View
      style={[
        styles.popup,
        {
          width: popupWidth,
          left,
          bottom: SCENE_HEIGHT - (y - POPUP_RISE),
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {rows.slice(0, MAX_ROWS).map((dose) => (
        <View key={dose.id} style={styles.row}>
          <ThemedText type="small" numberOfLines={1} style={styles.name}>
            {t('home.card.nextDose', {
              name: dose.productName,
              time: formatTime(dose.plannedAt),
            })}
          </ThemedText>
          {canTake && dose.state === 'pending' ? (
            <DoseActionButton
              label={t('home.take')}
              filled
              onPress={() => onTake(dose)}
            />
          ) : null}
        </View>
      ))}
      {rows.length > MAX_ROWS ? (
        <ThemedText type="small" themeColor="textSecondary">
          +{rows.length - MAX_ROWS}
        </ThemedText>
      ) : null}
    </View>
  );
}

function pendingFirst(doses: TodayDose[]): TodayDose[] {
  const pending = doses.filter(({ state }) => state === 'pending');
  return [...pending, ...doses.filter(({ state }) => state !== 'pending')];
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    gap: Spacing.four,
    padding: Spacing.eight,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.eight,
  },
  name: {
    flex: 1,
  },
});
