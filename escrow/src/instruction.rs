use borsh::{BorshSerialize,BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionType{
    InitEscrow{amount_x:u64,amount_y:u64,escrow_id:u64},
    AcceptEscrowOffer{escrow_id:u64}
}