use borsh::{BorshSerialize,BorshDeserialize};

#[derive(BorshDeserialize,BorshSerialize)]
pub enum InstructionType{
    InitStake{bump:u8},
    Stake{amount:u64},
    Unstake{bump:u8,amount:u64},
    WithdrawUnstaked{bump:u8},
    CloseStakeAccount{bump:u8}

    //delegate vote to
    //close account and get back rent
}