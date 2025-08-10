-- Happy Sisters Contribution Tracker Database Schema with RLS
-- This schema includes improvements and Row Level Security policies

-- Option 1: If you want to keep existing data, run this migration script
-- Option 2: If you want to start fresh, uncomment the DROP statements below

-- UNCOMMENT THESE LINES TO START FRESH (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS public.transaction CASCADE;
-- DROP TABLE IF EXISTS public.members CASCADE;
-- DROP VIEW IF EXISTS public.transaction_summary CASCADE;

-- Enable RLS on auth.users (if not already enabled)
-- Note: This is usually enabled by default in Supabase

-- Check if members table needs modifications
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'email') THEN
    ALTER TABLE public.members ADD COLUMN email character varying(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'created_at') THEN
    ALTER TABLE public.members ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'updated_at') THEN
    ALTER TABLE public.members ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
  END IF;
END $$;

-- Update members table structure
ALTER TABLE public.members ALTER COLUMN role SET DEFAULT 'member';

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'members_role_check') THEN
    ALTER TABLE public.members ADD CONSTRAINT members_role_check CHECK (role IN ('admin', 'member'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'members_email_unique') THEN
    ALTER TABLE public.members ADD CONSTRAINT members_email_unique UNIQUE (email);
  END IF;
END $$;

-- Check if transaction table needs modifications
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction' AND column_name = 'updated_at') THEN
    ALTER TABLE public.transaction ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction' AND column_name = 'date') THEN
    ALTER TABLE public.transaction ADD COLUMN date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction' AND column_name = 'created_by') THEN
    ALTER TABLE public.transaction ADD COLUMN created_by uuid DEFAULT auth.uid();
  END IF;
END $$;

-- Update transaction table structure
ALTER TABLE public.transaction ALTER COLUMN amount TYPE decimal(10,2);
ALTER TABLE public.transaction ALTER COLUMN member_id SET NOT NULL;
ALTER TABLE public.transaction ALTER COLUMN description SET NOT NULL;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'transaction_type_check') THEN
    ALTER TABLE public.transaction ADD CONSTRAINT transaction_type_check CHECK (type IN ('contribution', 'withdrawal'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'transaction_amount_positive') THEN
    ALTER TABLE public.transaction ADD CONSTRAINT transaction_amount_positive CHECK (amount > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'transaction_created_by_fkey') THEN
    ALTER TABLE public.transaction ADD CONSTRAINT transaction_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.members(id);
  END IF;
END $$;

-- Enable Row Level Security (safely)
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'members' AND relrowsecurity = true) THEN
    ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'transaction' AND relrowsecurity = true) THEN
    ALTER TABLE public.transaction ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all members" ON public.members;
DROP POLICY IF EXISTS "Users can insert own member record" ON public.members;
DROP POLICY IF EXISTS "Admins can update member records" ON public.members;
DROP POLICY IF EXISTS "Admins can delete member records" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can insert transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can update transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.transaction;

-- RLS Policies for members table

-- Policy 1: Users can view all members (needed for dropdown)
CREATE POLICY "Users can view all members" ON public.members
  FOR SELECT
  USING (true);

-- Policy 2: Users can insert their own member record during signup
CREATE POLICY "Users can insert own member record" ON public.members
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Only admins can update member records
CREATE POLICY "Admins can update member records" ON public.members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Only admins can delete member records
CREATE POLICY "Admins can delete member records" ON public.members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for transaction table

-- Policy 1: All authenticated users can view transactions
CREATE POLICY "Authenticated users can view transactions" ON public.transaction
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Only admins can insert transactions
CREATE POLICY "Only admins can insert transactions" ON public.transaction
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 3: Only admins can update transactions
CREATE POLICY "Only admins can update transactions" ON public.transaction
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Only admins can delete transactions
CREATE POLICY "Only admins can delete transactions" ON public.transaction
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_transaction_member_id ON public.transaction(member_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON public.transaction(type);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON public.transaction(date);
CREATE INDEX IF NOT EXISTS idx_transaction_created_by ON public.transaction(created_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (if they don't exist)
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
DROP TRIGGER IF EXISTS update_transaction_updated_at ON public.transaction;

CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON public.members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_updated_at 
  BEFORE UPDATE ON public.transaction 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for transaction statistics (optional)
CREATE OR REPLACE VIEW public.transaction_summary AS
SELECT 
  m.name as member_name,
  m.role as member_role,
  COUNT(t.id) as total_transactions,
  SUM(CASE WHEN t.type = 'contribution' THEN t.amount ELSE 0 END) as total_contributions,
  SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_withdrawals,
  SUM(CASE WHEN t.type = 'contribution' THEN t.amount ELSE -t.amount END) as net_balance
FROM public.members m
LEFT JOIN public.transaction t ON m.id = t.member_id
GROUP BY m.id, m.name, m.role;

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.transaction_summary TO authenticated;
GRANT SELECT ON public.members TO authenticated;
GRANT SELECT ON public.transaction TO authenticated;
GRANT INSERT ON public.members TO authenticated;
GRANT INSERT ON public.transaction TO authenticated;
GRANT UPDATE ON public.members TO authenticated;
GRANT UPDATE ON public.transaction TO authenticated;
GRANT DELETE ON public.members TO authenticated;
GRANT DELETE ON public.transaction TO authenticated;

-- Sample data (optional - remove in production)
-- Insert a default admin user (you'll need to replace with actual user ID from auth.users)
-- INSERT INTO public.members (id, name, role, email) 
-- VALUES ('YOUR_ADMIN_USER_ID_HERE', 'Admin User', 'admin', 'admin@happysisters.com');
