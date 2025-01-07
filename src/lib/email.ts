import { supabase } from './supabase';

export async function getEmailByWallet(walletAddress: string): Promise<string | null> {
  if (!walletAddress) return null;

  try {
    const { data, error } = await supabase
      .from('user_emails')
      .select('email')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching email:', error);
      return null;
    }

    return data?.email ?? null;
  } catch (error) {
    console.error('Error fetching email:', error);
    return null;
  }
}

export async function registerEmail(walletAddress: string, username: string) {
  if (!walletAddress || !username) {
    throw new Error('Wallet address and username are required');
  }

  const email = `${username.toLowerCase()}@dmail.org`;
  
  try {
    const { data, error } = await supabase
      .from('user_emails')
      .insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          email,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Username already taken');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error registering email:', error);
    throw error;
  }
}

export async function getWalletByEmail(email: string): Promise<string | null> {
  if (!email) return null;

  try {
    const { data, error } = await supabase
      .from('user_emails')
      .select('wallet_address')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }

    return data?.wallet_address ?? null;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
}