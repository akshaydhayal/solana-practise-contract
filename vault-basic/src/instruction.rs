use borsh::{BorshSerialize,BorshDeserialize};

#[derive(BorshDeserialize,BorshSerialize)]
pub enum InstructionType{
    Init,
    Deposit(u32),
    Withdraw(u32)
}