import { CLI } from "./CLI";
import { UserService } from "./models/User";
import { BankService } from "./services/BankService";

const startupParts = [
  "   __________  ____  ___       ____  ___    _   ____ __",
  "  / ____/ __ \\/ __ \\/   |     / __ )/   |  / | / / //_/",
  " / /   / / / / / / / /| |    / __  / /| | /  |/ / ,<   ",
  "/ /___/ /_/ / /_/ / ___ |   / /_/ / ___ |/ /|  / /| |  ",
  "\\____/\\____/_____/_/  |_|  /_____/_/  |_/_/ |_/_/ |_|",
  "",
  "La banque de demain, aujourd'hui.",
  "",
];

console.log(startupParts.join("\n"));

let isAuthenticated = false;

async function authenticate() {
  const maxAttempts = 3;

  while (UserService.mockUser.failedAttempts < maxAttempts) {
    const pin = await CLI.askValue("Entrez votre code PIN:", "text");

    if (!pin || pin.length !== 4 || isNaN(Number(pin))) {
      console.log("Le PIN doit être composé de 4 chiffres");
      continue;
    }

    const isValid = await UserService.verifyPin(pin);

    if (isValid) {
      UserService.mockUser.failedAttempts = 0;
      isAuthenticated = true;
      return true;
    }

    UserService.mockUser.failedAttempts++;
    console.log(`PIN incorrect. Il vous reste ${maxAttempts - UserService.mockUser.failedAttempts} tentative(s).`);
  }

  console.log("Nombre maximum de tentatives atteint. Application fermée.");
  process.exit(1);
}

Promise.all([
  UserService.initialize(),
  BankService.initialize()
]).then(() => {
  authenticate().then(() => {
    if (isAuthenticated) {
      const cli = new CLI([
        {
          title: "Déposer de l'argent",
          value: "deposit",
          action: async () => {
            const amount = await CLI.askValue("Montant à déposer:", "number");

            if (amount === undefined) {
              console.log("Opération annulée");
              return;
            }

            const transaction = await BankService.deposit(amount, UserService.mockUser.balance);

            if (transaction.success) {
              UserService.mockUser.balance = transaction.balanceAfter;
              console.log(`Dépôt de ${amount}€ effectué avec succès.`);
              console.log(`Nouveau solde: ${transaction.balanceAfter}€`);
            } else {
              console.log("Le montant du dépôt doit être un nombre entier positif.");
            }
          },
        },
        {
          title: "Retirer de l'argent",
          value: "withdraw",
          action: async () => {
            const amount = await CLI.askValue("Montant à retirer:", "number");

            if (amount === undefined) {
              console.log("Opération annulée");
              return;
            }

            const transaction = await BankService.withdraw(
              amount,
              UserService.mockUser.balance,
              UserService.mockUser.overdraftLimit
            );

            if (transaction.success) {
              UserService.mockUser.balance = transaction.balanceAfter;
              console.log(`Retrait de ${amount}€ effectué avec succès.`);
              console.log(`Nouveau solde: ${transaction.balanceAfter}€`);
            } else {
              if (!Number.isInteger(amount) || amount <= 0) {
                console.log("Le montant du retrait doit être un nombre entier positif.");
              } else {
                console.log(`Retrait impossible : le montant dépasse votre autorisation de découvert de ${UserService.mockUser.overdraftLimit}€`);
                console.log(`Solde actuel : ${UserService.mockUser.balance}€`);
              }
            }
          },
        },
        {
          title: "Voir l'historique",
          value: "history",
          action: () => {
            const transactions = BankService.getLastTransactions();

            if (transactions.length === 0) {
              console.log("Aucune transaction n'a été effectuée.");
              return;
            }

            console.log("\nHistorique des 10 dernières opérations :");
            console.log("----------------------------------------");

            transactions.forEach((transaction) => {
              const date = transaction.date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const type = transaction.type === 'deposit' ? 'Dépôt' : 'Retrait';
              const status = transaction.success ? 'Réussie' : 'Échouée';
              const sign = transaction.type === 'deposit' ? '+' : '-';

              console.log(`
Date: ${date}
Type: ${type}
Montant: ${sign}${transaction.amount}€
Solde après opération: ${transaction.balanceAfter}€
Statut: ${status}
----------------------------------------`);
            });
          },
        },
        {
          title: "Voir le solde",
          value: "balance",
          action: () => {
            console.log("\nInformations du compte :");
            console.log("----------------------------------------");
            console.log(`Solde actuel : ${UserService.mockUser.balance}€`);
            console.log(`Découvert autorisé : ${UserService.mockUser.overdraftLimit}€`);
            console.log(`Solde minimum possible : -${UserService.mockUser.overdraftLimit}€`);
            console.log("----------------------------------------");
          },
        },
      ]);

      cli.menu();
    }
  });
});
