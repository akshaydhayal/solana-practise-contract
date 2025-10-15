use pinocchio::{
    account_info::AccountInfo,entrypoint, entrypoint::{ ProgramResult},
    msg, program_entrypoint, program_error::ProgramError, pubkey::Pubkey
};
use pinocchio_token::state::Mint;
// use pinocchio_token::{};
pub struct DepositAccounts<'a>{
    pub owner:&'a AccountInfo,
    pub vault:&'a AccountInfo
}

impl <'a> TryFrom<&'a[AccountInfo]> for DepositAccounts<'a>{
    type Error=ProgramError;
    fn try_from(accounts:&'a [AccountInfo]) -> Result<Self,Self::Error>{
        let [owner,vault,_]=accounts else{
            return Err(ProgramError::NotEnoughAccountKeys);
        };
        if !owner.is_signer(){
            return Err(ProgramError::MissingRequiredSignature);
        }
        if !vault.is_owned_by(&pinocchio_system::ID){
            return Err(ProgramError::InvalidAccountOwner);
        }
        Ok(DepositAccounts { owner, vault })
    }
}

struct DepositInstructionData{
    data:u64
}
impl<'a> TryFrom<&'a [u8]> for DepositInstructionData{
    type Error=ProgramError;
    fn try_from(data:&'a [u8])->Result<Self,Self::Error>{
        if data.len()!=size_of::<u64>(){
            return Err(ProgramError::InvalidInstructionData);
        }
        let amount=u64::from_le_bytes(data.try_into().unwrap());
        if amount==0{
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(Self{data:1 as u64})
    }
}

pub struct Deposit<'a>{
    accounts:DepositAccounts<'a>,
    instruction_data:DepositInstructionData
}
impl <'a> TryFrom<(&'a [u8], &'a [AccountInfo])> for Deposit<'a>{
    type Error=ProgramError;
    fn try_from((data,accounts):(&'a [u8], &'a [AccountInfo]))->Result<Self, Self::Error>{
        let a=DepositAccounts::try_from(accounts)?;
        let b=DepositInstructionData::try_from(data)?;
        Ok(Self{accounts:a,instruction_data:b})
    }
}
impl<'a> Deposit<'a>{
    // pub const DISCRIMINATOR:u8=0;
    pub const DISCRIMINATOR:&'a u8=&0;
    pub fn process(&self)->ProgramResult{
        //deposit loic
        Ok(())
    }
}






pub trait AccountCheck{
    fn check(acc:&AccountInfo)->Result<(),ProgramError>;
}
pub struct SignerAccount{}
impl AccountCheck for SignerAccount{
    fn check(acc:&AccountInfo)->Result<(),ProgramError>{
        if !acc.is_signer(){
            return Err(ProgramError::MissingRequiredSignature);
        }
        Ok(())
    }
}
pub struct SystemAccount{}
impl AccountCheck for SystemAccount{
    fn check(acc:&AccountInfo)->Result<(),ProgramError> {
        if !acc.is_owned_by(&pinocchio_system::id()){
            return Err(ProgramError::IllegalOwner);
        }
        Ok(())
    }
}

pub struct MintAccount{};
impl AccountCheck for MintAccount{
    fn check(acc:&AccountInfo)->Result<(),ProgramError>{
        if acc.owner()!=&pinocchio_token::ID{
            return Err(ProgramError::InvalidAccountOwner);
        }
        if acc.data_len()!=Mint::LEN{
            return Err(ProgramError::AccountDataTooSmall);
        }
        Ok(())
    }
}
// program_entrypoint!(process_instruction);
entrypoint!(process_instruction);
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    // msg!("hello : {}",2);    not possible to log using msg macro in nowithout std feature
    let ix=InstructionType::try_from_slice(instruction_data);
    Ok(())
}