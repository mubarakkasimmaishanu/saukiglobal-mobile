# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor Core
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Firebase & Push Notifications (Required since you use @capacitor/push-notifications)
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Cordova plugins (if any are used by Capacitor)
-keep class org.apache.cordova.** { *; }

# Splash Screen
-keep class androidx.core.splashscreen.** { *; }

# Keep line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Ignore missing Firebase ktx classes
-dontwarn com.google.firebase.ktx.Firebase
