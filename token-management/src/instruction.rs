use borsh::{BorshSerialize,BorshDeserialize};

#[derive(BorshSerialize,BorshDeserialize)]
pub enum InstructionType{
    InitMint{decimals:u8},
    CreateMintATA,
    MintTo{mint_amount:u64},
    TransferToAta{amount:u64},
    BurnTokens{amount:u64},
    FreezeATA,
    UnfreezeATA,
    SetAuthority,
    SetMintAuthority,
    CreateMintMetadata

    //close accounts(both ata and mint acc - get back the rent)
}