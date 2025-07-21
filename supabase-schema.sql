-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_azienda TEXT NOT NULL,
  nome_titolare TEXT NOT NULL,
  ragione_sociale TEXT NOT NULL,
  data_acquisizione DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create VSS transactions table
CREATE TABLE IF NOT EXISTS vss_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  note TEXT,
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GI transactions table
CREATE TABLE IF NOT EXISTS gi_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  note TEXT,
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create VSD transactions table
CREATE TABLE IF NOT EXISTS vsd_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  importo_totale DECIMAL(10,2) NOT NULL,
  importo_personale DECIMAL(10,2) NOT NULL,
  note TEXT,
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vss_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gi_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsd_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for clients
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for VSS transactions
CREATE POLICY "Users can view own VSS transactions" ON vss_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own VSS transactions" ON vss_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own VSS transactions" ON vss_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own VSS transactions" ON vss_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for GI transactions
CREATE POLICY "Users can view own GI transactions" ON gi_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own GI transactions" ON gi_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own GI transactions" ON gi_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own GI transactions" ON gi_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for VSD transactions
CREATE POLICY "Users can view own VSD transactions" ON vsd_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own VSD transactions" ON vsd_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own VSD transactions" ON vsd_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own VSD transactions" ON vsd_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_vss_transactions_user_id ON vss_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_vss_transactions_client_id ON vss_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_gi_transactions_user_id ON gi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gi_transactions_client_id ON gi_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_vsd_transactions_user_id ON vsd_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsd_transactions_client_id ON vsd_transactions(client_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
