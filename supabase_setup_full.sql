-- 1. DROP EXISTING CONSTRAINT & ALIGN OLD ROLES
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles SET role = 'user' WHERE role = 'victim';
UPDATE public.profiles SET role = 'official' WHERE role IN ('hospital', 'government', 'police', 'ngo');

-- 2. CREATE OR UPDATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user',
  name text,
  organization text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Re-apply constraint matching new system
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'official', 'admin'));

-- 2. AUTO CREATE PROFILE ON SIGNUP
-- Create a trigger function that automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown User')
  );
  RETURN new;
END;
$$;

-- Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. HELPER FUNCTION TO GET ROLE
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. RLS POLICIES FOR INCIDENTS
DROP POLICY IF EXISTS "Incidents are viewable by everyone" ON public.incidents;
CREATE POLICY "Incidents are viewable by everyone" ON public.incidents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert incidents" ON public.incidents;
CREATE POLICY "Users can insert incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Officials and Admins can update incidents" ON public.incidents;
CREATE POLICY "Officials and Admins can update incidents" ON public.incidents FOR UPDATE USING (public.get_user_role() IN ('official', 'admin'));

DROP POLICY IF EXISTS "Admins can delete incidents" ON public.incidents;
CREATE POLICY "Admins can delete incidents" ON public.incidents FOR DELETE USING (public.get_user_role() = 'admin');

-- 6. RLS POLICIES FOR RESOURCES
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
CREATE POLICY "Resources are viewable by everyone" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
CREATE POLICY "Admins can insert resources" ON public.resources FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE USING (public.get_user_role() = 'admin');

-- 7. RLS POLICIES FOR ORGANIZATIONS
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (public.get_user_role() = 'admin');

-- 8. RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage any profile" ON public.profiles;
CREATE POLICY "Admins can manage any profile" ON public.profiles FOR ALL USING (public.get_user_role() = 'admin');

-- 9. ELEVATE YOUR USER TO ADMIN (Execute this part manually if desired)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'lak@gmail.com';
