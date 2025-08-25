-- Create pending_transactions table to track M-Pesa payment requests
CREATE TABLE IF NOT EXISTS pending_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_request_id TEXT UNIQUE NOT NULL,
  merchant_request_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  phone_number TEXT NOT NULL,
  admin_phone_number TEXT, -- Admin's phone number receiving the money
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  mpesa_receipt_number TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add M-Pesa related columns to existing transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS mpesa_receipt_number TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_transactions_checkout_request_id 
ON pending_transactions(checkout_request_id);

CREATE INDEX IF NOT EXISTS idx_pending_transactions_user_id 
ON pending_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_pending_transactions_status 
ON pending_transactions(status);

-- Enable RLS
ALTER TABLE pending_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_transactions
CREATE POLICY "Users can view their own pending transactions" 
ON pending_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending transactions" 
ON pending_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all pending transactions
CREATE POLICY "Admins can view all pending transactions" 
ON pending_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Grant permissions
GRANT ALL ON pending_transactions TO authenticated;
GRANT ALL ON pending_transactions TO service_role;
