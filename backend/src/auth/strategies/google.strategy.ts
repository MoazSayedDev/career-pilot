import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(new Error('Google account does not have an email'), false);
    }

    const googleUser = {
      googleId: profile.id,
      email: email.trim().toLowerCase(),

      username: profile.displayName || profile.username || 'user',

      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,

      avatar: profile.photos?.[0]?.value,

      accessToken,
      refreshToken,
    };

    done(null, googleUser);
  }
}
