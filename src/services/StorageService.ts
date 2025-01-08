import * as fs from 'fs/promises';
import * as path from 'path';
import { User } from '../models/User';
import { Transaction } from './BankService';

export class StorageService {
  private static readonly DATA_DIR = 'data';
  private static readonly USER_FILE = 'user.json';
  private static readonly TRANSACTIONS_FILE = 'transactions.json';

  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.DATA_DIR);
    } catch {
      await fs.mkdir(this.DATA_DIR);
    }
  }

  private static getFilePath(filename: string): string {
    return path.join(this.DATA_DIR, filename);
  }

  static async saveUser(user: User): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(
      this.getFilePath(this.USER_FILE),
      JSON.stringify(user, null, 2)
    );
  }

  static async loadUser(): Promise<User | null> {
    try {
      const data = await fs.readFile(this.getFilePath(this.USER_FILE), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(
      this.getFilePath(this.TRANSACTIONS_FILE),
      JSON.stringify(transactions, null, 2)
    );
  }

  static async loadTransactions(): Promise<Transaction[]> {
    try {
      const data = await fs.readFile(this.getFilePath(this.TRANSACTIONS_FILE), 'utf-8');
      const transactions = JSON.parse(data);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    } catch {
      return [];
    }
  }
} 