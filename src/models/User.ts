import * as bcrypt from 'bcrypt';
import { StorageService } from '../services/StorageService';

export interface User {
  id: string;
  pin: string;
  balance: number;
  savingsBalance: number;
  savingsRate: number;
  failedAttempts: number;
  overdraftLimit: number;
}

export class UserService {
  private static readonly SALT_ROUNDS = 10;

  public static mockUser: User = {
    id: '1',
    pin: '$2b$10$ZoLzTGVR/.YJ47uolVaFJ.iKAkTt9O0nQtPBfl0zBKE.0ULysTP6e', // PIN: 1234
    balance: 1000,
    savingsBalance: 0,
    savingsRate: 0.02,
    failedAttempts: 0,
    overdraftLimit: 100
  };

  static async initialize(): Promise<void> {
    const savedUser = await StorageService.loadUser();
    if (savedUser) {
      this.mockUser = savedUser;
    } else {
      await StorageService.saveUser(this.mockUser);
    }
  }

  static async verifyPin(pin: string): Promise<boolean> {
    return bcrypt.compare(pin, this.mockUser.pin);
  }

  static async updateUser(updates: Partial<User>): Promise<void> {
    this.mockUser = { ...this.mockUser, ...updates };
    await StorageService.saveUser(this.mockUser);
  }
}
