use anchor_lang::prelude::*;

declare_id!("A7gYrajmfgaZv6TrSSdmkDiFfUVtNge6WaHw5jZwAxdG");

#[program]
pub mod anchor_nft {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
