-- Migration 003: Add user_id to drafts and enable RLS on all tables
-- Run this in Supabase SQL Editor

-- 1. Add user_id column to drafts table (if missing)
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Enable RLS on all core tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for events
CREATE POLICY "events_select_own" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_own" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update_own" ON events FOR UPDATE USING (true);
CREATE POLICY "events_delete_own" ON events FOR DELETE USING (true);

-- 4. Create RLS policies for schedule_items
CREATE POLICY "schedule_items_select_own" ON schedule_items FOR SELECT USING (true);
CREATE POLICY "schedule_items_insert_own" ON schedule_items FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_items_update_own" ON schedule_items FOR UPDATE USING (true);
CREATE POLICY "schedule_items_delete_own" ON schedule_items FOR DELETE USING (true);

-- 5. Create RLS policies for behavior_profiles
CREATE POLICY "behavior_profiles_select_own" ON behavior_profiles FOR SELECT USING (true);
CREATE POLICY "behavior_profiles_insert_own" ON behavior_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "behavior_profiles_update_own" ON behavior_profiles FOR UPDATE USING (true);

-- 6. Create RLS policies for behavior_events
CREATE POLICY "behavior_events_select_own" ON behavior_events FOR SELECT USING (true);
CREATE POLICY "behavior_events_insert_own" ON behavior_events FOR INSERT WITH CHECK (true);

-- 7. Create RLS policies for repair_proposals
CREATE POLICY "repair_proposals_select_own" ON repair_proposals FOR SELECT USING (true);
CREATE POLICY "repair_proposals_insert_own" ON repair_proposals FOR INSERT WITH CHECK (true);

-- 8. Create RLS policies for drafts
CREATE POLICY "drafts_select_own" ON drafts FOR SELECT USING (true);
CREATE POLICY "drafts_insert_own" ON drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "drafts_delete_own" ON drafts FOR DELETE USING (true);

-- 9. Create RLS policies for onboarding_responses
CREATE POLICY "onboarding_responses_select_own" ON onboarding_responses FOR SELECT USING (true);
CREATE POLICY "onboarding_responses_insert_own" ON onboarding_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "onboarding_responses_update_own" ON onboarding_responses FOR UPDATE USING (true);

-- 10. Create RLS policies for app_users
CREATE POLICY "app_users_select_own" ON app_users FOR SELECT USING (true);
CREATE POLICY "app_users_insert" ON app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "app_users_update_own" ON app_users FOR UPDATE USING (true);

-- 11. Create RLS policies for capacity_profiles
CREATE POLICY "capacity_profiles_all" ON capacity_profiles FOR ALL USING (true);

-- 12. Create RLS policies for goals
CREATE POLICY "goals_all" ON goals FOR ALL USING (true);

-- 13. Create RLS policies for dependencies
CREATE POLICY "dependencies_all" ON dependencies FOR ALL USING (true);

-- Note: These policies use USING (true) because we use the service_role key
-- on the server side. The actual user_id scoping is done in the API layer.
-- If you switch to Supabase Auth (anon key from client), change these to:
--   USING (user_id = auth.uid())
