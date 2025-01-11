import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import {
  UserCredentials,
  AuthResponse,
  UserRole,
  TokenData,
  RegisterResponse,
} from './interfaces/auth.interfaces';
import * as admin from 'firebase-admin';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(credentials: UserCredentials): Promise<RegisterResponse> {
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

      // Generate verification link
      const actionCodeSettings = {
        url: `${process.env.CLIENT_URL}/verify-email`,
        handleCodeInApp: true,
      };

      const emailVerificationLink = await admin
        .auth()
        .generateEmailVerificationLink(userRecord.email!, actionCodeSettings);

      // Send verification email
      await this.mailService.sendVerificationEmail(
        userRecord.email!,
        emailVerificationLink,
        credentials.name,
      );

      return {
        message:
          'Registration successful! Please check your email for verification.',
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Login an existing user
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      // Verify if the user exists in the Firebase Auth
      const userRecord = await this.firebaseService.auth.getUserByEmail(
        credentials.email,
      );

      // Check if email is verified in Firebase Auth
      if (!userRecord.emailVerified) {
        throw new UnauthorizedException('Email is not verified');
      }

      // Get user data from Firestore
      const userDocRef = this.firebaseService
        .collection('users')
        .doc(userRecord.uid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }
      const userData = userDoc.data();

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: userRecord.uid,
        email: userRecord.email,
        role: userData.role,
      } as TokenData);

      return {
        tokens: { accessToken: token },
        User: {
          name: userRecord.displayName,
          email: userRecord.email,
          role: userData.role,
        },
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
