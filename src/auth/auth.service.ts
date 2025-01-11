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
    private mailService: MailService
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
        isVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

       // Generate verification link
       const actionCodeSettings = {
        url: `${process.env.CLIENT_URL}/verify-email?token=${userRecord.uid}`,
        handleCodeInApp: true,
      };

      const emailVerificationLink = await admin
        .auth()
        .generateEmailVerificationLink(userRecord.email!, actionCodeSettings);

      // Send verification email
      await this.mailService.sendVerificationEmail(
        userRecord.email!,
        emailVerificationLink,
        credentials.name
      );

      return {
        message: 'Registration successful! Please check your email for verification.',
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new BadRequestException(error.message);
    }
  }

  //Verify User's Account
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      // Decode the token to extract the userID
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);

      const userId = decodedToken.uid;

      // Retrieve user document and check the current status
      const userDocRef = this.firebaseService.collection('users').doc(userId);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }

      const userData = userDoc.data();
      if (userData.isVerified) {
        throw new UnauthorizedException('Email is already verified');
      }

      // Update user document to set isVerified to true

      await userDocRef.update({ isVerified: true });
      return { message: 'Email verification successful' };
    } catch (error) {
      this.logger.error('Email verification failed:', error);
      throw new UnauthorizedException('Email verification failed');
    }
  }
}
