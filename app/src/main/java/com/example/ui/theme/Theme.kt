package com.example.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PolishPurplePrimary,
    onPrimary = PolishDeepPurpleOnPrimary,
    primaryContainer = PolishMediumPurpleContainer,
    onPrimaryContainer = PolishOnPurpleContainer,

    secondary = PolishPurplePrimary,
    onSecondary = PolishDeepPurpleOnPrimary,
    secondaryContainer = PolishDarkCardSurface,
    onSecondaryContainer = PolishPurplePrimary,

    tertiary = PolishPurplePrimary,
    onTertiary = PolishDeepPurpleOnPrimary,
    tertiaryContainer = PolishMediumPurpleContainer,
    onTertiaryContainer = PolishOnPurpleContainer,

    error = PolishExpenseRed,
    onError = PolishDeepPurpleOnPrimary,
    errorContainer = PolishExpenseContainer,
    onErrorContainer = PolishExpenseOnContainer,

    background = PolishDarkBackground,
    onBackground = PolishTextPrimaryDark,
    surface = PolishDarkCardSurface,
    onSurface = PolishTextPrimaryDark,
    surfaceVariant = PolishDarkSurfaceVariant,
    onSurfaceVariant = PolishTextSecondaryDark,
    outline = PolishDarkBorder,
    outlineVariant = PolishDarkBorder
)

private val LightColorScheme = lightColorScheme(
    primary = PolishLightPrimary,
    onPrimary = PolishLightOnPrimary,
    primaryContainer = PolishLightPrimaryContainer,
    onPrimaryContainer = PolishLightOnPrimaryContainer,

    secondary = PolishLightPrimary,
    onSecondary = PolishLightOnPrimary,
    secondaryContainer = PolishLightSurfaceVariant,
    onSecondaryContainer = PolishLightPrimary,

    tertiary = PolishLightPrimary,
    onTertiary = PolishLightOnPrimary,
    tertiaryContainer = PolishLightPrimaryContainer,
    onTertiaryContainer = PolishLightOnPrimaryContainer,

    error = PolishLightExpenseRed,
    onError = PolishLightOnPrimary,
    errorContainer = PolishLightExpenseContainer,
    onErrorContainer = PolishLightExpenseRed,

    background = PolishLightBackground,
    onBackground = PolishTextPrimaryLight,
    surface = PolishLightCardSurface,
    onSurface = PolishTextPrimaryLight,
    surfaceVariant = PolishLightSurfaceVariant,
    onSurfaceVariant = PolishTextSecondaryLight,
    outline = PolishLightBorder,
    outlineVariant = PolishLightBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
