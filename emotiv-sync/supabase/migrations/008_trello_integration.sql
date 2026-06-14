-- Add Trello card → project mapping
ALTER TABLE public.everhour_projects
  ADD COLUMN IF NOT EXISTS trello_card_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_trello_card_id
  ON public.everhour_projects(trello_card_id)
  WHERE trello_card_id IS NOT NULL;

-- Map Trello member IDs to app users
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS trello_member_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_trello_member_id
  ON public.user_profiles(trello_member_id)
  WHERE trello_member_id IS NOT NULL;

-- Expose projects to authenticated users (read only) for the Power-Up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'everhour_projects' AND policyname = 'users_read_projects'
  ) THEN
    CREATE POLICY "users_read_projects" ON public.everhour_projects
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END$$;
