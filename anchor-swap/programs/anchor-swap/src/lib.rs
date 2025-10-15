pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{Mint,TokenInterface,TokenAccount}
};
pub use constants::*;
pub use instructions::*;
pub use state::*;
// use crate::take_offer::TakeOffer;

declare_id!("AVyDh4ZbhUTmakYUyMx7LeaPhzcUmp4zHVgHtxq1V6AM");

#[program]
pub mod anchor_swap{
    use crate::{instructions::take_offer::TakeOffer, take_offer::send_wanted_tokens_to_maker};

    use super::*;

    pub fn make_offer(ctx:Context<MakeOffer>, id:u64, token_a_offered_amount:u64, token_b_wanted_amount:u64)->Result<()>{
        msg!("a");
        instructions::make_offer::send_offered_tokens_to_vault(&ctx,token_a_offered_amount);
        msg!("b");
        instructions::make_offer::save_offer(ctx, id, token_b_wanted_amount);
        Ok(())
    }

    pub fn take_offer(ctx:Context<TakeOffer>,id:u64)->Result<()>{
        msg!("c");
        instructions::take_offer::send_wanted_tokens_to_maker(&ctx)?;
        instructions::take_offer::withdraw_tokens_and_close_vault(ctx)?;
        msg!("d");
        Ok(())
    }
}

