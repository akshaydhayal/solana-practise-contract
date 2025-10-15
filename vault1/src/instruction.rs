use borsh::{BorshDeserialize,BorshSerialize};

#[derive(BorshSerialize,BorshDeserialize)]
pub enum InstructionType{
    VaultInit,
    DepositToVault{amount:u64},
    WithdrawFromVault{amount:u64}
}