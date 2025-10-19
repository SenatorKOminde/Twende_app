import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '@/shared/constants';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.secondary, // Use secondary color (green) for driver app
    primaryContainer: COLORS.secondaryDark,
    secondary: COLORS.primary,
    secondaryContainer: COLORS.primaryDark,
    tertiary: COLORS.accent,
    tertiaryContainer: COLORS.accentDark,
    error: COLORS.danger,
    errorContainer: COLORS.dangerDark,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceVariant: COLORS.border,
    outline: COLORS.border,
    outlineVariant: COLORS.grayLight,
    shadow: COLORS.black,
    scrim: COLORS.black,
    inverseSurface: COLORS.grayDark,
    inverseOnSurface: COLORS.white,
    inversePrimary: COLORS.secondary,
    elevation: {
      level0: 'transparent',
      level1: COLORS.surface,
      level2: COLORS.surface,
      level3: COLORS.surface,
      level4: COLORS.surface,
      level5: COLORS.surface,
    },
    surfaceDisabled: COLORS.grayLight,
    onSurfaceDisabled: COLORS.gray,
    backdrop: COLORS.black,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.secondary,
    primaryContainer: COLORS.secondaryDark,
    secondary: COLORS.primary,
    secondaryContainer: COLORS.primaryDark,
    tertiary: COLORS.accent,
    tertiaryContainer: COLORS.accentDark,
    error: COLORS.danger,
    errorContainer: COLORS.dangerDark,
    background: COLORS.grayDark,
    surface: COLORS.gray,
    surfaceVariant: COLORS.grayLight,
    outline: COLORS.grayLight,
    outlineVariant: COLORS.gray,
    shadow: COLORS.black,
    scrim: COLORS.black,
    inverseSurface: COLORS.white,
    inverseOnSurface: COLORS.grayDark,
    inversePrimary: COLORS.secondary,
    elevation: {
      level0: 'transparent',
      level1: COLORS.gray,
      level2: COLORS.gray,
      level3: COLORS.gray,
      level4: COLORS.gray,
      level5: COLORS.gray,
    },
    surfaceDisabled: COLORS.grayLight,
    onSurfaceDisabled: COLORS.gray,
    backdrop: COLORS.black,
  },
};

export const theme = lightTheme;
