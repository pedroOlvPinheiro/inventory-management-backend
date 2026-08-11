import { Withdrawal } from '@prisma/client';

export class WithdrawalOutputDTO {
  id: string;
  materialId: string;
  quantity: number;
  personId: string;
  occasionId: string;
  withdrawalGroupId: string | null;
  createdAt: Date;
  warning?: string;

  constructor(withdrawal: Withdrawal, warning?: string) {
    this.id = withdrawal.id;
    this.materialId = withdrawal.materialId;
    this.quantity = withdrawal.quantity;
    this.personId = withdrawal.personId;
    this.occasionId = withdrawal.occasionId;
    this.withdrawalGroupId = withdrawal.withdrawalGroupId;
    this.createdAt = withdrawal.createdAt;
    this.warning = warning;
  }
}
