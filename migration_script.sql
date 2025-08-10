-- MIGRATION SCRIPT: Run this on your existing database
-- This script safely adds RLS to existing tables without breaking anything

-- Step 1: Add missing columns to existing tables
-- Add email to members table if it doesn't exist
DO $$
BEGIN
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

-- Add missing columns to transaction table
DO $$
BEGIN
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

-- Step 2: Update data types and constraints
ALTER TABLE public.transaction ALTER COLUMN amount TYPE decimal(10,2);

-- Step 3: Add constraints safely
DO $$
BEGIN
  -- Add role check constraint
  BEGIN
    ALTER TABLE public.members ADD CONSTRAINT members_role_check CHECK (role IN ('admin', 'member'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Add transaction type check
  BEGIN
    ALTER TABLE public.transaction ADD CONSTRAINT transaction_type_check CHECK (type IN ('contribution', 'withdrawal'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Add amount positive check
  BEGIN
    ALTER TABLE public.transaction ADD CONSTRAINT transaction_amount_positive CHECK (amount > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Step 4: Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all members" ON public.members;
DROP POLICY IF EXISTS "Users can insert own member record" ON public.members;
DROP POLICY IF EXISTS "Admins can update member records" ON public.members;
DROP POLICY IF EXISTS "Admins can delete member records" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can insert transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can update transactions" ON public.transaction;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.transaction;

-- Members table policies
CREATE POLICY "Users can view all members" ON public.members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own member record" ON public.members
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update member records" ON public.members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete member records" ON public.members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transaction table policies
CREATE POLICY "Authenticated users can view transactions" ON public.transaction
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert transactions" ON public.transaction
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update transactions" ON public.transaction
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete transactions" ON public.transaction
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_transaction_member_id ON public.transaction(member_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON public.transaction(type);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON public.transaction(date);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
DROP TRIGGER IF EXISTS update_transaction_updated_at ON public.transaction;

CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON public.members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_updated_at 
  BEFORE UPDATE ON public.transaction 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Update existing role values to lowercase (if needed)
UPDATE public.members SET role = 'member' WHERE role = 'Member';
UPDATE public.members SET role = 'admin' WHERE role = 'Admin';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! RLS is now enabled.';
END $$;
