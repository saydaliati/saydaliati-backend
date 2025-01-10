import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import {
  UserCredentials,
  AuthResponse,
  UserRole,
  TokenData,
} from './interfaces/auth.interfaces';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
  ) {}

  async register(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      // Create user in Firebase Auth
      const userRecord = await this.firebaseService.auth.createUser({
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.name,
      });

      // Create user document in Firestore
      await this.firebaseService.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        role: UserRole.USER,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate tokens
      const tokens = await this.generateTokens(userRecord.uid);

      return {
        User: {
          uid: userRecord.uid,
          email: userRecord.email!,
          role: UserRole.USER,
          name: userRecord.displayName!,
        },
        tokens,
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }
  private async generateTokens(uid: string): Promise<TokenData> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { uid },
        { expiresIn: '15m' }
      ),
      this.jwtService.signAsync(
        { uid },
        { expiresIn: '7d' }
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      return this.generateTokens(decoded.uid);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

