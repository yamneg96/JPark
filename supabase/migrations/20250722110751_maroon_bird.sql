/*
  # Create jobs table for job postings

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `skills` (text array)
      - `budget` (numeric)
      - `project_type` (text) - fixed, hourly, ongoing
      - `experience_level` (text)
      - `location` (text)
      - `duration` (text)
      - `requirements` (text, optional)
      - `status` (text, default 'open')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for job management
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  skills text[] DEFAULT '{}',
  budget numeric NOT NULL CHECK (budget > 0),
  project_type text NOT NULL CHECK (project_type IN ('fixed', 'hourly', 'ongoing')),
  experience_level text NOT NULL CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  location text NOT NULL,
  duration text NOT NULL,
  requirements text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for everyone to read open jobs
CREATE POLICY "Anyone can read open jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (status = 'open' OR client_id = auth.uid());

-- Policy for clients to manage their own jobs
CREATE POLICY "Clients can manage own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Policy for admins to manage all jobs
CREATE POLICY "Admins can manage all jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();