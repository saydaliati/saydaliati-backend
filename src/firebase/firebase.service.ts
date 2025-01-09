import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  public firebase: admin.firestore.Firestore;
  public auth: admin.auth.Auth;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialize Firebase Admin
    const serviceAccount = {
      projectId: this.configService.get('FIREBASE_PROJECT'),
    };
    projectKey: this.configService
      .get('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');
    clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL');

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
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
