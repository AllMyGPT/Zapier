ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS everhour_user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_profiles_everhour_id
  ON public.user_profiles(everhour_user_id)
  WHERE everhour_user_id IS NOT NULL;
