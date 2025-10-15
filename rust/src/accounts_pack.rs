use solana_program::{
    program_error::ProgramError,
    pubkey::Pubkey
};
use arrayref::{
    array_refs,
    array_ref,
    mut_array_refs,
    array_mut_ref
};
use spl_token_interface::{
    instruction
};

#[derive(Debug , PartialEq)]
#[repr(C)]
pub struct LiquidityPool{
    pub owner:Pubkey,
    pub mintA:Pubkey,
    pub mintB:Pubkey,
    pub amountA:u64,
    pub amountB:u64,
    pub fee_bps:u16,
    pub LPToken:Pubkey
}

impl LiquidityPool{
    pub const LEN:usize = 146; 

    pub fn unpack_from_slicee(account_data:&[u8])->Result<Self,ProgramError>{
        if account_data.len() < Self::LEN{
            return Err(ProgramError::InvalidAccountData);
        }
        let len=Self::LEN;
        let (data)=array_ref![account_data, 0, 146];
        let (owner, mint_a, mint_b, amount_a, 
            amount_b,fee_bps,lp_token)=array_refs![data, 32, 32, 32, 8, 8, 2, 32];
        
        Ok(Self { 
            owner:   Pubkey::new_from_array(*owner), 
            mintA:   Pubkey::new_from_array(*mint_a), 
            mintB:   Pubkey::new_from_array(*mint_b),
            amountA: u64::from_le_bytes(*amount_a), 
            amountB: u64::from_le_bytes(*amount_b),
            fee_bps: u16::from_le_bytes(*fee_bps), 
            LPToken: Pubkey::new_from_array(*lp_token)
         })
    }

    pub fn pack_into_slicee(&self, dst:&mut [u8]){
        let dst=array_mut_ref![dst,0,146];
        let (owner,mint_a,mint_b,
            amount_a,amount_b,fee_bps,
            lp_mint)=mut_array_refs![dst,32,32,32,8,8,2,32];

        let x=self.mintA;
        let y=self.mintA.as_ref();
        let z=self.mintA.to_bytes();
        
        owner.copy_from_slice(self.owner.as_ref());
        mint_a.copy_from_slice(self.mintA.as_ref());
        mint_b.copy_from_slice(self.mintB.as_ref());
        *amount_a=self.amountA.to_le_bytes();
        *amount_b=self.amountB.to_le_bytes();
        *fee_bps=self.fee_bps.to_le_bytes();
        lp_mint.copy_from_slice(self.LPToken.as_ref());
    }
}


mod tests{
    use super::*;
    #[test]
    fn test1(){
        let pool=LiquidityPool{
            owner:Pubkey::new_unique(),
            mintA:Pubkey::new_unique(),
            mintB:Pubkey::new_unique(),
            amountA:1000,
            amountB:2000,
            fee_bps:200,
            LPToken:Pubkey::new_unique(),
        };
        let mut dst:[u8;200]=[0; 200];
        // let mut dst:[u8;146]=[0; 146];
        let serialised_pool_data=LiquidityPool::pack_into_slicee(&pool, &mut dst);
        println!("a");
        println!("serialised pool data : {:?}",serialised_pool_data);
        println!("len : {}",dst.len());
        println!("serialised pool data : {:?}",dst);

        
        let deserialised_data_back=LiquidityPool::unpack_from_slicee(&dst);
        match deserialised_data_back {
            Ok(lp_pool)=>{
                println!("deserialised data back :{:?} ",lp_pool);
                assert!(lp_pool==pool);
            },
            Err(e)=>{
                println!("{}",e);
            }
        }
        println!("len : {}",dst.len());
        // assert!(4==4);
    }
    // #[test]
    // fn test2(){
    //     assert!(4==5);
    // }
}