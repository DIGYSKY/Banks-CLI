import { StorageService } from './StorageService';
import { UserService } from '../models/User';

export interface Transaction {
  date: Date;
  type: 'deposit' | 'withdrawal';
  amount: number;
  balanceAfter: number;
  success: boolean;
}

export class BankService {
  private static transactions: Transaction[] = [];

  static async initialize(): Promise<void> {
    this.transactions = await StorageService.loadTransactions();
  }

  static async deposit(amount: number, currentBalance: number): Promise<Transaction> {
    if (amount <= 0 || !Number.isInteger(amount)) {
      const transaction = {
        date: new Date(),
        type: 'deposit' as const,
        amount,
        balanceAfter: currentBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    const newBalance = currentBalance + amount;
    const transaction = {
      date: new Date(),
      type: 'deposit' as const,
      amount,
      balanceAfter: newBalance,
      success: true
    };

    await this.saveTransaction(transaction);
    await UserService.updateUser({ balance: newBalance });
    return transaction;
  }

  static async withdraw(amount: number, currentBalance: number, overdraftLimit: number): Promise<Transaction> {
    if (amount <= 0 || !Number.isInteger(amount)) {
      const transaction = {
        date: new Date(),
        type: 'withdrawal' as const,
        amount,
        balanceAfter: currentBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    const newBalance = currentBalance - amount;
    if (newBalance < -overdraftLimit) {
      const transaction = {
        date: new Date(),
        type: 'withdrawal' as const,
        amount,
        balanceAfter: currentBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    const transaction = {
      date: new Date(),
      type: 'withdrawal' as const,
      amount,
      balanceAfter: newBalance,
      success: true
    };

    await this.saveTransaction(transaction);
    await UserService.updateUser({ balance: newBalance });
    return transaction;
  }

  private static async saveTransaction(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
    await StorageService.saveTransactions(this.transactions);
  }

  static getLastTransactions(limit: number = 10): Transaction[] {
    return this.transactions.slice(-limit);
  }
} 