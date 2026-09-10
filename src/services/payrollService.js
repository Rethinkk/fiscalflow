const payrollExpenseCategories = {
  net_salary: "Net salaries",
  payroll_taxes_social_security: "Payroll taxes and social security"
};

export function createPayrollExpenseLines(transactions) {
  const grouped = new Map();

  transactions
    .filter((transaction) => payrollExpenseCategories[transaction.cashCategory])
    .forEach((transaction) => {
      const current = grouped.get(transaction.cashCategory) ?? {
        code: transaction.cashCategory,
        label: payrollExpenseCategories[transaction.cashCategory],
        amount: 0
      };

      current.amount += Math.abs(transaction.amount);
      grouped.set(transaction.cashCategory, current);
    });

  return [...grouped.values()].map((line) => ({
    ...line,
    amount: roundMoney(line.amount)
  }));
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
