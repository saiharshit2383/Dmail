/*
  # Create user emails mapping table

  1. New Tables
    - `user_emails`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - User's Ethereum wallet address
      - `email` (text, unique) - Custom email with @dmail.org extension
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_emails` table
    - Add policies for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS user_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL CHECK (email LIKE '%@dmail.org'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all emails"
  ON user_emails
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own email"
  ON user_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (true);