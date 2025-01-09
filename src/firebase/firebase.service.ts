import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  public firestore: admin.firestore.Firestore;
  public auth: admin.auth.Auth;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccount = {
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      };

      console.log('Initializing Firebase with project ID:', serviceAccount.projectId);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });

      this.firestore = admin.firestore();
      this.auth = admin.auth();

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }



  // Helper to get a collection reference
  collection(collectionName: string) {
    return admin.firestore().collection(collectionName);
  }

  // Helper to get a document reference
  doc(collectionName: string, documentId: string) {
    return admin.firestore().collection(collectionName).doc(documentId);
  }


}
