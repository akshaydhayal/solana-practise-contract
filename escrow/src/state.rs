use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    pubkey::Pubkey
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Escrow{
    pub owner: Pubkey,
    pub initialiser:Pubkey,
    pub taker:Pubkey,
    pub initialiser_ata_x:Pubkey,
    pub initialiser_ata_y:Pubkey,
    pub amount_x:u64,
    pub amount_y:u64,
    pub taker_ata_x:Pubkey,
    pub taker_ata_y:Pubkey,
    // pub is_pending:bool
    pub state:EscrowState,
    pub expiry_time:u64
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum EscrowState{
    PENDING,
    COMPLETED,
    CANCELED
}

// user X - deposits m tokens from his ata x to pda ata x and demands n tokens of y 
// user Y - comes, sees deal, accept deal, then transfer n tokens of y