-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR 3 TABLES
-- ============================================================================

-- ===========================================================================
-- 1. CUSTOMER_TRANSACTIONS
-- ===========================================================================

-- Enable RLS
ALTER TABLE customer_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Admins can insert customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Admins can update customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Admins can delete customer_transactions" ON customer_transactions;

-- Create policies for Admin/Superadmin
CREATE POLICY "Admins can view all customer_transactions"
ON customer_transactions
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can insert customer_transactions"
ON customer_transactions
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can update customer_transactions"
ON customer_transactions
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can delete customer_transactions"
ON customer_transactions
FOR DELETE
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

-- Grant necessary permissions
GRANT ALL ON customer_transactions TO authenticated;
GRANT ALL ON customer_transactions TO anon;

COMMENT ON TABLE customer_transactions IS 'Customer transactions - RLS enabled';
COMMENT ON POLICY "Admins can view all customer_transactions" ON customer_transactions IS 'Allow admins to view all transactions';

-- ===========================================================================
-- 2. EMAIL_CAMPAIGNS
-- ===========================================================================

-- Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Admins can insert email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Admins can update email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Admins can delete email_campaigns" ON email_campaigns;

-- Create policies for Admin/Superadmin
CREATE POLICY "Admins can view all email_campaigns"
ON email_campaigns
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can insert email_campaigns"
ON email_campaigns
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can update email_campaigns"
ON email_campaigns
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can delete email_campaigns"
ON email_campaigns
FOR DELETE
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

-- Grant necessary permissions
GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_campaigns TO anon;

COMMENT ON TABLE email_campaigns IS 'Email campaigns - RLS enabled';
COMMENT ON POLICY "Admins can view all email_campaigns" ON email_campaigns IS 'Allow admins to view all campaigns';

-- ===========================================================================
-- 3. LOGIN_ATTEMPTS
-- ===========================================================================

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can insert login_attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admins can view all login_attempts" ON login_attempts;

-- Public can insert login_attempts (for logging)
CREATE POLICY "Public can insert login_attempts"
ON login_attempts
FOR INSERT
WITH CHECK (true); -- Anyone can insert login attempts

-- Only admins can view login_attempts
CREATE POLICY "Admins can view all login_attempts"
ON login_attempts
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE role IN ('admin', 'superadmin')
    )
);

-- Grant necessary permissions
GRANT INSERT ON login_attempts TO authenticated;
GRANT INSERT ON login_attempts TO anon;
GRANT SELECT ON login_attempts TO authenticated;
GRANT SELECT ON login_attempts TO anon;

COMMENT ON TABLE login_attempts IS 'Login attempts tracking - RLS enabled';
COMMENT ON POLICY "Public can insert login_attempts" ON login_attempts IS 'Allow anyone to log attempts (needed before auth)';
COMMENT ON POLICY "Admins can view all login_attempts" ON login_attempts IS 'Only admins can view login attempts';

-- ===========================================================================
-- VERIFICATION QUERIES
-- ===========================================================================

-- Check RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('customer_transactions', 'email_campaigns', 'login_attempts')
ORDER BY tablename;

-- Show policies for these tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customer_transactions', 'email_campaigns', 'login_attempts')
ORDER BY tablename, policyname;
