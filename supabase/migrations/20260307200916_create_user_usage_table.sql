/*
  # Create user_usage table

  ## Purpose
  Tracks free usage count per authenticated user. One row per user.

  ## New Tables
  - `user_usage`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users, unique)
    - `usage_count` (integer, default 0)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read, insert, and update their own row
*/

CREATE TABLE IF NOT EXISTS user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_usage_user_id_unique UNIQUE (user_id)
);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON user_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
