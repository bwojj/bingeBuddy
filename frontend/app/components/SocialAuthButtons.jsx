import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { socialAuth } from '@/components/AuthApi';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, FontSize, Radii } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

// Google's official "G" logomark, reproduced at brand color -- a single-tone
// icon font glyph can't represent this, so it's drawn directly.
function GoogleLogo({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.5404-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <Path fill="#FBBC05" d="M3.964 10.71c-.18-.5404-.2827-1.1177-.2827-1.71s.1027-1.1695.2827-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <Path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6564 3.5795 9 3.5795z" />
    </Svg>
  );
}

// Google/Apple sign-in, dropped into both signup and login -- a returning
// social user hitting either screen is functionally doing the same thing, so
// both routing branches below are correct regardless of which screen called this.
export default function SocialAuthButtons() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  // Google's authorization server only accepts a redirect_uri whose scheme is
  // the reversed iOS client ID for an "iOS" type OAuth client (enforced
  // server-side, not just convention) -- the app's own "frontend://" scheme
  // gets rejected with "Error 400: invalid_request". This reversed scheme is
  // registered as a second CFBundleURLTypes entry in app.json.
  // `native` (not `scheme`+`path`) is required here: `scheme`+`path` goes
  // through Linking.createURL, which always emits the authority form
  // "scheme://path" -- Google rejects that with the same Error 400 since
  // "oauthredirect" is parsed as a host. `native` returns the string as-is,
  // giving the required single-slash path form "scheme:/oauthredirect".
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'com.googleusercontent.apps.130968382458-ir4u3u007bp3qssjolledlqirmghqs9b:/oauthredirect',
  });
  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    redirectUri,
  });

  const handleResult = (result) => {
    setBusy(false);
    if (!result?.success) {
      Alert.alert('Sign-in failed', result?.error || 'Something went wrong. Please try again.');
      return;
    }
    if (result.is_new) {
      // Mirrors plain signup: don't flip isAuthenticated yet, just push into
      // onboarding while still under the (auth) segment. Social sign-in
      // skips signup.jsx's name field, so it's collected here instead.
      router.push('/(auth)/(onboarding)/name');
    } else {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        setBusy(true);
        socialAuth('google', accessToken).then(handleResult);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Sign-in failed', 'Something went wrong. Please try again.');
    }
  }, [response]);

  const handleGooglePress = () => {
    setBusy(true);
    promptAsync().catch(() => setBusy(false));
  };

  const handleAppleSignIn = async () => {
    try {
      setBusy(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const result = await socialAuth('apple', credential.identityToken);
      handleResult(result);
    } catch (e) {
      setBusy(false);
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign-in failed', 'Something went wrong. Please try again.');
      }
    }
  };

  if (Platform.OS !== 'ios') return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, busy && { opacity: 0.6 }]}
        onPress={handleGooglePress}
        disabled={busy}
        activeOpacity={0.85}
      >
        <GoogleLogo size={18} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={Radii.btn}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  googleButtonText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.line,
  },
  dividerText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
  },
});
