-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('client', 'worker', 'admin')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  avatar_url text,
  bio text,
  skills text[],
  experience_level text CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies for jobs
CREATE POLICY "Anyone can read open jobs" ON jobs FOR SELECT TO authenticated USING (status = 'open' OR client_id = auth.uid());
CREATE POLICY "Clients can manage own jobs" ON jobs FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "Admins can manage all jobs" ON jobs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter text NOT NULL,
  proposed_rate numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- Enable RLS for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policies for applications
CREATE POLICY "Workers can read own applications" ON applications FOR SELECT TO authenticated USING (worker_id = auth.uid());
CREATE POLICY "Clients can read applications for own jobs" ON applications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid())
);
CREATE POLICY "Workers can create applications" ON applications FOR INSERT TO authenticated WITH CHECK (worker_id = auth.uid());
CREATE POLICY "Clients can update applications for own jobs" ON applications FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.client_id = auth.uid())
);
CREATE POLICY "Admins can manage all applications" ON applications FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();