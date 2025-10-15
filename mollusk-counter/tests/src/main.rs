use mollusk_svm::{
    Mollusk,
    program,
    result::Check
};
use solana_sdk::{
    pubkey,pubkey::Pubkey,
    account::Account,
    instruction::{Instruction,AccountMeta},
    system_program
};

#[test]
fn test(){
    let program_id=Pubkey::new_unique();
    let mollusk=Mollusk::new(&program_id,"../target/deploy/program");

    let user=Pubkey::new_unique();
    let user_account=Account::new(1000_000_000, 0, &system_program::ID);
    
    let rent=mollusk.sysvars.rent.minimum_balance(4);
    let seeds=&[b"counter",user.as_ref()];
    let (counter,bump)=Pubkey::find_program_address(seeds, &program_id);
    // let counter_account=Account{
    //     owner:program_id,
    //     data:vec![],
    //     executable:false,
    //     lamports:rent,
    //     rent_epoch:0
    // };
    let (system,system_account)=program::keyed_account_for_system_program();
    let accounts=[
        (user,user_account),
        // (counter,counter_account),   wrong as counter account is not created via client, but via progra,, we will give a empty account and program will create it
        (counter,Account::new(0,0,&system_program::ID)),
        // (system, system_account)
        (system_program::ID, Account::new(0, 0, &program::loader_keys::NATIVE_LOADER))
    ];

    println!("user : {} , counter : {} system_program : {}, program_id : {}",user,counter,system_program::ID,program_id);

    let ix=Instruction::new_with_bytes(program_id, &[0,3,0,0,0],
    vec![
        AccountMeta::new(user,true),
        AccountMeta::new(counter, false),
        AccountMeta::new_readonly(system_program::ID,false)
    ]);
    // mollusk.sysvars.keyed_account_for_rent_sysvar()
    mollusk.process_and_validate_instruction(&ix,&accounts,
    &[
        Check::success(),
        Check::account(&counter).data(&[3,0,0,0]).build(),
        Check::account(&counter).owner(&program_id).build(),
        Check::account(&counter).executable(false).build(),
        Check::account(&counter).lamports(mollusk.sysvars.rent.minimum_balance(4)).build(),
        Check::compute_units(5000)
    ]
    );
}