// utils/transaction.ts
import { Transaction } from "sequelize";
import { db } from "../models/index";

export const runInTransaction = async <T>(
  fn: (tx: Transaction) => Promise<T>
): Promise<T> => {
  const tx = await db.sequelize.transaction();
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  }
};
