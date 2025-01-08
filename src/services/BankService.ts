import { StorageService } from './StorageService';
import { UserService } from '../models/User';

export interface Transaction {
  date: Date;
  type: 'deposit' | 'withdrawal' | 'savings_deposit' | 'savings_withdrawal';
  amount: number;
  balanceAfter: number;
  savingsBalanceAfter?: number;
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

  static async transferToSavings(amount: number, currentBalance: number, currentSavingsBalance: number): Promise<Transaction> {
    if (amount <= 0 || !Number.isInteger(amount)) {
      const transaction = {
        date: new Date(),
        type: 'savings_deposit' as const,
        amount,
        balanceAfter: currentBalance,
        savingsBalanceAfter: currentSavingsBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    if (currentBalance - amount < -UserService.mockUser.overdraftLimit) {
      const transaction = {
        date: new Date(),
        type: 'savings_deposit' as const,
        amount,
        balanceAfter: currentBalance,
        savingsBalanceAfter: currentSavingsBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    const newBalance = currentBalance - amount;
    const newSavingsBalance = currentSavingsBalance + amount;

    const transaction = {
      date: new Date(),
      type: 'savings_deposit' as const,
      amount,
      balanceAfter: newBalance,
      savingsBalanceAfter: newSavingsBalance,
      success: true
    };

    await this.saveTransaction(transaction);
    await UserService.updateUser({
      balance: newBalance,
      savingsBalance: newSavingsBalance
    });
    return transaction;
  }

  static async transferFromSavings(amount: number, currentBalance: number, currentSavingsBalance: number): Promise<Transaction> {
    if (amount <= 0 || !Number.isInteger(amount) || amount > currentSavingsBalance) {
      const transaction = {
        date: new Date(),
        type: 'savings_withdrawal' as const,
        amount,
        balanceAfter: currentBalance,
        savingsBalanceAfter: currentSavingsBalance,
        success: false
      };
      await this.saveTransaction(transaction);
      return transaction;
    }

    const newBalance = currentBalance + amount;
    const newSavingsBalance = currentSavingsBalance - amount;

    const transaction = {
      date: new Date(),
      type: 'savings_withdrawal' as const,
      amount,
      balanceAfter: newBalance,
      savingsBalanceAfter: newSavingsBalance,
      success: true
    };

    await this.saveTransaction(transaction);
    await UserService.updateUser({
      balance: newBalance,
      savingsBalance: newSavingsBalance
    });
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