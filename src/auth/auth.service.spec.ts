import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/mail/mail.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from './interfaces/auth.interfaces';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  },
  auth: () => ({
    generateEmailVerificationLink: jest.fn(),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;

  const mockFirebaseService = {
    auth: {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe('register', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockUserRecord = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    const mockDocRef = {
      set: jest.fn(),
    };

    beforeEach(() => {
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef),
      });
      mockFirebaseService.auth.createUser.mockResolvedValue(mockUserRecord);
      (
        admin.auth().generateEmailVerificationLink as jest.Mock
      ).mockResolvedValue('mock-verification-link');
    });

    it('should successfully register a new user', async () => {
      const result = await service.register(mockCredentials);

      expect(mockFirebaseService.auth.createUser).toHaveBeenCalledWith({
        email: mockCredentials.email,
        password: mockCredentials.password,
        displayName: mockCredentials.name,
      });

      expect(mockDocRef.set).toHaveBeenCalledWith({
        email: mockUserRecord.email,
        role: UserRole.USER,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCredentials.email,
        undefined,
        mockCredentials.name,
      );

      expect(result).toEqual({
        message:
          'Registration successful! Please check your email for verification.',
      });
    });

    it('should throw BadRequestException when registration fails', async () => {
      const error = new Error('Firebase error');
      mockFirebaseService.auth.createUser.mockRejectedValue(error);

      await expect(service.register(mockCredentials)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login function', () => {
    let mockFirebaseService: any;
    let mockJwtService: any;
    let mockAuthService: any;
  
    beforeEach(() => {
      mockFirebaseService = firebaseService;
      mockAuthService = service;
      mockJwtService = jwtService;
    });
  
    it('should successfully log in the user and return a token', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockResolvedValue({
          user: { uid: '12345', email: 'test@example.com', displayName: 'Test User' },
        }),
      };
  
      const mockUserRecord = {
        uid: '12345',
        emailVerified: true,
        email: 'test@example.com',
        displayName: 'Test User',
      };
  
      const mockUserDoc = { exists: true, data: jest.fn().mockReturnValue({ role: 'admin' }) };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
      mockFirebaseService.auth.getUser = jest.fn().mockResolvedValue(mockUserRecord);
      mockFirebaseService.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserDoc),
      });
      mockJwtService.sign = jest.fn().mockReturnValue('jwt-token');
  
      const result = await mockAuthService.login(credentials);
  
      expect(result).toEqual({
        token: 'jwt-token',
        User: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
      });
      expect(mockFirebaseService.getClientAuth).toHaveBeenCalled();
      expect(mockFirebaseService.auth.getUser).toHaveBeenCalledWith('12345');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '12345',
        email: 'test@example.com',
        role: 'admin',
      });
    });
  
    it('should throw an UnauthorizedException when email is not verified', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockResolvedValue({
          user: { uid: '12345', email: 'test@example.com', displayName: 'Test User' },
        }),
      };
  
      const mockUserRecord = {
        uid: '12345',
        emailVerified: false,
        email: 'test@example.com',
        displayName: 'Test User',
      };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
      mockFirebaseService.auth.getUser = jest.fn().mockResolvedValue(mockUserRecord);
  
      await expect(mockAuthService.login(credentials)).rejects.toThrowError(
        new UnauthorizedException('Email not verified')
      );
    });
  
    it('should throw an UnauthorizedException when user is not found in Firestore', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockResolvedValue({
          user: { uid: '12345', email: 'test@example.com', displayName: 'Test User' },
        }),
      };
  
      const mockUserRecord = {
        uid: '12345',
        emailVerified: true,
        email: 'test@example.com',
        displayName: 'Test User',
      };
  
      const mockUserDoc = { exists: false };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
      mockFirebaseService.auth.getUser = jest.fn().mockResolvedValue(mockUserRecord);
      mockFirebaseService.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserDoc),
      });
  
      await expect(mockAuthService.login(credentials)).rejects.toThrowError(
        new UnauthorizedException('User not found in database')
      );
    });
  
    it('should throw an UnauthorizedException for invalid email or password', async () => {
      const credentials = { email: 'wrong@example.com', password: 'wrongpassword' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockRejectedValue({
          code: 'auth/wrong-password',
        }),
      };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
  
      await expect(mockAuthService.login(credentials)).rejects.toThrowError(
        new UnauthorizedException('Invalid email or password')
      );
    });
  
    it('should throw an UnauthorizedException for too many requests', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockRejectedValue({
          code: 'auth/too-many-requests',
        }),
      };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
  
      await expect(mockAuthService.login(credentials)).rejects.toThrowError(
        new UnauthorizedException('Too many failed login attempts. Please try again later.')
      );
    });
  
    it('should throw an UnauthorizedException for other errors', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
  
      const mockAuth = {
        signInWithEmailAndPassword: jest.fn().mockRejectedValue({
          code: 'auth/unknown-error',
          message: 'Some error occurred',
        }),
      };
  
      mockFirebaseService.getClientAuth = jest.fn().mockReturnValue(mockAuth);
  
      await expect(mockAuthService.login(credentials)).rejects.toThrowError(
        new UnauthorizedException('Authentication failed: Some error occurred')
      );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});  
