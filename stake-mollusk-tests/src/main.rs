use mollusk_svm::{
    Mollusk,
    program::keyed_account_for_system_program
};

use solana_pubkey::Pubkey;
use solana_account::{
    Account
};
use solana_sdk::{
    rent::Rent, sysvar::Sysvar,
    instruction::Instruction,
    instruction::AccountMeta
};


#[test]
fn test(){
    let program_id=Pubkey::new_unique();
    let mollusk=Mollusk::new(&program_id,"stake");

    let (system,system_account)=keyed_account_for_system_program();
    let user=Pubkey::new_unique();
    let user_account=Account::new(1000_000_000, 0, &system);

    let seeds=&[b"stake",user.as_ref()];
    let (stake_pda,bump)=Pubkey::find_program_address(seeds, &program_id);

    let stake_pda_size:usize=32+32+32+8+1+8+8+8+8;
    let stake_pda_min_rent_exempt_bal=mollusk.sysvars.rent.minimum_balance(stake_pda_size);
    let stake_pda_account=Account{
        owner:program_id,
        data:vec![],
        executable:false,
        lamports:stake_pda_min_rent_exempt_bal,
        rent_epoch:0
    };
    Instruction
    let accounts=[
        (user,user_account),
        (stake_pda,stake_pda_account),
        (system,system_account)
    ];

    
    let ix=Instruction::new_with_bytes(program_id,
        &[0,bump],
        vec![
            AccountMeta{pubkey:user, is_signer:true, is_writable:true},
            AccountMeta{pubkey:stake_pda, is_signer:false, is_writable:true},
            AccountMeta{pubkey:system, is_signer:false, is_writable:false}
        ]
    );
    mollusk.process_instruction(&ix, &accounts);

}