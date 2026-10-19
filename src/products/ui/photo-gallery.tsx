import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MIN_TOUCH_SIZE, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { useTheme } from '@/commons/ui/use-theme';
import { imageFileUri, type ProductImage } from '@/images/image-service';
import { ZoomablePhoto } from '@/products/ui/zoomable-photo';

type Props = {
  images: ProductImage[];
  startIndex: number | null;
  onClose: () => void;
};

type ContentProps = {
  images: ProductImage[];
  startIndex: number;
  onClose: () => void;
};

export function PhotoGallery({ images, startIndex, onClose }: Props) {
  return (
    <Modal
      visible={startIndex !== null}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      {startIndex !== null ? (
        <GalleryContent
          images={images}
          startIndex={startIndex}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function GalleryContent({ images, startIndex, onClose }: ContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { top } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState(startIndex);

  const onPageSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      setCurrent(Math.round(event.nativeEvent.contentOffset.x / width)),
    [width],
  );

  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: theme.scrim }]}
    >
      <FlatList
        data={images}
        keyExtractor={(image) => image.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={onPageSettled}
        renderItem={({ item, index }) => (
          <ZoomablePhoto
            uri={imageFileUri(item.fileName)}
            width={width}
            height={height}
            active={index === current}
          />
        )}
      />
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('images.close')}
        style={[styles.close, { top: top + Spacing.eight }]}
      >
        <Icon name="close" size={24} color={theme.onSnackbar} />
      </Pressable>
      <ThemedText
        style={[styles.counter, { top: top + Spacing.sixteen }]}
        themeColor="onSnackbar"
        accessibilityLiveRegion="polite"
      >
        {t('images.position', { current: current + 1, total: images.length })}
      </ThemedText>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  close: {
    position: 'absolute',
    right: Spacing.eight,
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});
