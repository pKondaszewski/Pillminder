import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { DestructiveButton } from '@/commons/ui/button';
import { Chip } from '@/commons/ui/chip';
import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Spacing } from '@/commons/ui/constants/theme';
import { Stepper } from '@/commons/ui/stepper';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { doseQuantityText } from '@/doses/dose-service';
import type { Intake, IntakeEdit } from '@/intakes/intake-service';

type Props = {
  intake: Intake;
  onSave: (id: string, edit: IntakeEdit) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function IntakeEditSheet({ intake, onSave, onDelete, onClose }: Props) {
  const { t } = useTranslation();
  const { formatTime, is24Hour } = useFormatTime();
  const [quantity, setQuantity] = useState(intake.quantity);
  const [takenAt, setTakenAt] = useState(intake.takenAt);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const onPicked = (_event: DateTimePickerChangeEvent, picked: Date) => {
    setPickerOpen(false);
    const moved = new Date(takenAt);
    moved.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    setTakenAt(moved);
  };

  return (
    <>
      <BottomSheet
        visible
        title={t('intake.editTitle', { name: intake.productName })}
        onClose={onClose}
        onSave={() => onSave(intake.id, { quantity, takenAt })}
      >
        <ThemedText type="smallBold" themeColor="textSecondary">
          {t('intake.quantity')}
        </ThemedText>
        <Stepper
          decrementLabel={t('intake.decreaseQuantity')}
          incrementLabel={t('intake.increaseQuantity')}
          onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
          onIncrement={() => setQuantity(quantity + 1)}
        >
          <ThemedText type="headline" style={styles.value}>
            {doseQuantityText(quantity, intake.unit, t) ?? quantity}
          </ThemedText>
        </Stepper>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {t('intake.time')}
        </ThemedText>
        <ThemedView style={styles.row}>
          <Chip
            label={formatTime(takenAt)}
            selected={false}
            onPress={() => setPickerOpen(true)}
          />
        </ThemedView>
        <DestructiveButton
          label={t('intake.delete')}
          onPress={() => setConfirmingDelete(true)}
        />
        {pickerOpen ? (
          <DateTimePicker
            value={takenAt}
            mode="time"
            is24Hour={is24Hour}
            onValueChange={onPicked}
            onDismiss={() => setPickerOpen(false)}
          />
        ) : null}
      </BottomSheet>
      <ConfirmDialog
        visible={confirmingDelete}
        destructive
        title={t('intake.deleteTitle')}
        message={t('intake.deleteMessage', { name: intake.productName })}
        confirmLabel={t('intake.delete')}
        onConfirm={() => onDelete(intake.id)}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  value: {
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.eight,
  },
});
