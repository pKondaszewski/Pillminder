import { type Ref } from 'react';
import {
  KeyboardAwareScrollView as LibraryKeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';

import { Spacing } from '@/commons/ui/constants/theme';

type Props = KeyboardAwareScrollViewProps & {
  ref?: Ref<KeyboardAwareScrollViewRef>;
};

export function KeyboardAwareScrollView(props: Props) {
  return (
    <LibraryKeyboardAwareScrollView
      bottomOffset={Spacing.sixteen}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
}
