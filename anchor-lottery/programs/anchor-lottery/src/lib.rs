use anchor_lang::prelude::*;

declare_id!("5StRHT4zArGuw4W289Hg911H56XDzBwWveV9azuts75P");

#[program]
pub mod anchor_lottery {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
