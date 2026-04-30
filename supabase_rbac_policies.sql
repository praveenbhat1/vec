-- CrisisChain RBAC & RLS Policies
-- Execute this script in your Supabase SQL Editor

-- 1. Create a helper function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Enable RLS on all relevant tables
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Users can only insert/update their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Admins can update/delete any profile
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can delete any profile" ON public.profiles FOR DELETE USING (public.get_user_role() = 'admin');

-- 4. Incidents Policies
-- Everyone (including anon) can view incidents so the public map works
CREATE POLICY "Incidents are viewable by everyone" ON public.incidents FOR SELECT USING (true);
-- Authenticated users can report (insert) incidents
CREATE POLICY "Authenticated users can insert incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);
-- Officials and Admins can update incidents (status)
CREATE POLICY "Officials and Admins can update incidents" ON public.incidents FOR UPDATE USING (public.get_user_role() IN ('official', 'admin'));
-- Only Admins can delete incidents
CREATE POLICY "Admins can delete incidents" ON public.incidents FOR DELETE USING (public.get_user_role() = 'admin');

-- 5. Resources Policies
-- Everyone can read resources (so Dashboard and Analytics can aggregate if needed, though hidden in UI)
CREATE POLICY "Resources are viewable by everyone" ON public.resources FOR SELECT USING (true);
-- Only Admins can insert/update/delete resources
CREATE POLICY "Admins can insert resources" ON public.resources FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE USING (public.get_user_role() = 'admin');

-- 6. Organizations Policies
-- Everyone can read organizations
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations FOR SELECT USING (true);
-- Only Admins can modify organizations
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (public.get_user_role() = 'admin');

-- 7. Messages & Activity Logs Policies
-- Everyone can read
CREATE POLICY "Messages viewable by everyone" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Logs viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
-- Authenticated users can insert messages
CREATE POLICY "Auth users can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
-- Admins can manage
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can manage logs" ON public.activity_logs FOR ALL USING (public.get_user_role() = 'admin');
