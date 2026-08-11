import { WithdrawalOutputDTO } from './withdrawal-output.dto';

export class WithdrawalBatchOutputDTO {
  withdrawalGroupId: string;
  personId: string;
  occasionId: string;
  items: WithdrawalOutputDTO[];

  constructor(
    withdrawalGroupId: string,
    personId: string,
    occasionId: string,
    items: WithdrawalOutputDTO[],
  ) {
    this.withdrawalGroupId = withdrawalGroupId;
    this.personId = personId;
    this.occasionId = occasionId;
    this.items = items;
  }
}
