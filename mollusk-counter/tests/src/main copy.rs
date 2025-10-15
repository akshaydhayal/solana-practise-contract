use mollusk_svm::Mollusk;
use solana_sdk::{
    pubkey,
    pubkey::Pubkey,
    account::Account,
    instruction::{Instruction,AccountMeta},
    system_program
};

#[test]
fn test(){

    let program_id=pubkey!("");
    let mollusk=Mollusk::new(&program_id, "target/deploy/program.so");

    let user=Pubkey::new_unique();
    let user_account=Account::new(1000_000_000, 0, &system_program::ID);

    let data_account=Pubkey::new_unique();
    let rent=mollusk.sysvars.rent.minimum_balance(4);
    let data_account_account=Account{
        data:vec![],
        owner:program_id,
        lamports:rent,
        executable:false,
        rent_epoch:0
    };

}





















// use mollusk_svm::{result::Check, Mollusk};
// use solana_sdk::{
//     pubkey::Pubkey,
//     account::Account,
//     system_program,
//     instruction::{Instruction, AccountMeta}
// };

// const program_id:Pubkey=solana_sdk::pubkey!("22222222222222222222222222222222222222222222");

// #[test]
// fn test(){
//     let mollusk=Mollusk::new(&program_id,"target/deploy/program");

//     let payer=Pubkey::new_unique();
//     let payer_account=Account::new(100_00, 0, &system_program::ID);

//     let default_account=Account::default();

//     let account_data:Vec<u8>=vec![];
//     let rent=mollusk.sysvars.rent.minimum_balance(account_data.len());

//     let data_account=Pubkey::new_unique();
//     let data_account_account=Account{
//         owner:program_id,
//         data:account_data,
//         lamports:rent,
//         executable:false,
//         rent_epoch:0
//     };

//     let accounts=[
//         (data_account,data_account_account),
//         (payer,payer_account)
//     ];

//     let ix=Instruction::new_with_bytes(program_id, &[0] ,
//         vec![
//             AccountMeta::new(payer, true),
//             AccountMeta::new_readonly(data_account,false),
//             AccountMeta::new_readonly(system_program::ID, false)
//         ]);
//     // mollusk.process_instruction(&ix, &accounts);
//     mollusk.process_and_validate_instruction(&ix,&accounts,
//         &[
//             Check::success(),
//             Check::compute_units(5000),
//             Check::account(&payer).owner(&system_program::ID).build(),
//         ]
//     );
// }






fn main(){}