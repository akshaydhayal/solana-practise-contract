use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    pubkey::Pubkey,
    program_error::ProgramError,
    program_pack::{Pack,Sealed},
    msg
};
use arrayref::{
    array_refs,
    array_ref,
    mut_array_refs,
    array_mut_ref
};

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct LiquidityPool{
    pub owner:Pubkey,
    pub mintA:Pubkey,
    pub mintB:Pubkey,
    pub amountA:u64,
    pub amountB:u64,
    pub fee_bps:u16,
    pub LPToken:Pubkey
}
impl Sealed for LiquidityPool{}

impl Pack for LiquidityPool{
    const LEN:usize=32+32+32+8+8+2+32;

    fn unpack_from_slice(pool:&[u8])->Result<Self,ProgramError>{
        msg!("unpack called");
        if pool.len()< Self::LEN{
            return Err(ProgramError::InvalidAccountData);
        }
        let pool_slice=array_ref![pool,0,146];
        let (owner,mint_a,mint_b,amount_a,
            amount_b,fee_bps,lp_token)=array_refs![pool_slice,32,32,32,8,8,2,32];
        Ok(LiquidityPool{
            owner:Pubkey::new_from_array(*owner),
            mintA:Pubkey::new_from_array(*mint_a),
            mintB:Pubkey::new_from_array(*mint_b),
            amountA:u64::from_le_bytes(*amount_a),
            amountB:u64::from_le_bytes(*amount_b),
            fee_bps:u16::from_le_bytes(*fee_bps),
            LPToken:Pubkey::new_from_array(*lp_token)
        })
    }

    fn pack_into_slice(&self,dst:&mut[u8]){
        msg!("pack called");
        let dst=array_mut_ref![dst,0,146];
        let (owner,mint_a,mint_b,
            amount_a,amount_b,fee_bps,
            lp_mint)=mut_array_refs![dst,32,32,32,8,8,2,32];
        *owner=self.owner.to_bytes();
        *mint_a=self.mintA.to_bytes();
        *mint_b=self.mintB.to_bytes();
        *amount_a=self.amountA.to_le_bytes();
        *amount_b=self.amountB.to_le_bytes();
        *fee_bps=u16::to_le_bytes(self.fee_bps);
        *lp_mint=self.LPToken.to_bytes();
    }
}