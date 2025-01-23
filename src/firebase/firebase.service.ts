import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public firestore: admin.firestore.Firestore;
  public auth: admin.auth.Auth;
  public clientAuth: any; // Firebase Client Auth

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Initialize Admin SDK if not already initialized
      if (!admin.apps.length) {
        const serviceAccount = {
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
        };

        this.logger.log(
          `Initializing Firebase Admin with project ID: ${serviceAccount.projectId}`,
        );

        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
      } else {
        this.logger.log('Firebase Admin is already initialized');
      }

      // Initialize Client SDK if not already initialized
      if (!getApps().length) {
        const clientConfig = {
          apiKey: this.configService.get<string>('FIREBASE_API_KEY'),
          authDomain: this.configService.get<string>('FIREBASE_AUTH_DOMAIN'),
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        };

        const clientApp = initializeApp(clientConfig);
        this.clientAuth = getAuth(clientApp);
      } else {
        this.logger.log('Firebase Client SDK is already initialized');
        this.clientAuth = getAuth(getApp());
      }

      this.firestore = admin.firestore();
      this.auth = admin.auth();

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Firebase initialization error:', error);
      throw error;
    }
  }

  collection(collectionName: string) {
    return this.firestore.collection(collectionName);
  }

  doc(collectionName: string, documentId: string) {
    return this.collection(collectionName).doc(documentId);
  }

  async verifyToken(token: string) {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getClientAuth() {
    return this.clientAuth;
  }
}
