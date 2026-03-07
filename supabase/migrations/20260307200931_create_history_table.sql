/*
  # Create history table

  ## Purpose
  Moves summarization history from device-local AsyncStorage to Supabase,
  so history is tied to the authenticated user and synced across devices.

  ## New Tables
  - `history`
    - `id` (text, primary key) — client-generated unique id
    - `user_id` (uuid, references auth.users) — owner
    - `input_type` (text) — one of: text, file, url, audio, camera
    - `title` (text) — short title for the item
    - `result` (text) — the summarized/translated output
    - `action` (text) — the action performed (summarize, translate, etc.)
    - `timestamp` (bigint) — unix timestamp in ms
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only access their own history rows
*/

CREATE TABLE IF NOT EXISTS history (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type text NOT NULL DEFAULT 'text',
  title text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  timestamp bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS history_user_id_timestamp_idx ON history(user_id, timestamp DESC);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history"
  ON history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
