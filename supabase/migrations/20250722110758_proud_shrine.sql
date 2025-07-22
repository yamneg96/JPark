/*
  # Create applications table for job applications

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `worker_id` (uuid, references profiles)
      - `cover_letter` (text)
      - `proposed_rate` (numeric, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `applications` table
    - Add policies for application management
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter text NOT NULL,
  proposed_rate numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy for workers to read their own applications
CREATE POLICY "Workers can read own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (worker_id = auth.uid());

-- Policy for clients to read applications for their jobs
CREATE POLICY "Clients can read applications for own jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid()
    )
  );

-- Policy for workers to create applications
CREATE POLICY "Workers can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (worker_id = auth.uid());

-- Policy for clients to update applications for their jobs
CREATE POLICY "Clients can update applications for own jobs"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid()
    )
  );

-- Policy for admins to manage all applications
CREATE POLICY "Admins can manage all applications"
  ON applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();