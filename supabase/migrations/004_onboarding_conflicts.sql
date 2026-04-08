-- Migration 004: Onboarding questions fields + schedule change log
-- Run this in Supabase SQL Editor

-- 1. Extend onboarding_responses with Q1-Q4 fields
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS primary_focus TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS motivation_type TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS preferred_slot TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS recovery_style TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS priority_boost NUMERIC DEFAULT 0;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS motivation_weight NUMERIC DEFAULT 0;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS slot_weight NUMERIC DEFAULT 0.5;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS repair_strategy_bias TEXT DEFAULT 'same_day';
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Schedule change log — stores explanations for every reschedule/conflict resolution
CREATE TABLE IF NOT EXISTS public.schedule_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID,
    change_type TEXT NOT NULL,
    old_datetime TIMESTAMPTZ,
    new_datetime TIMESTAMPTZ,
    reason TEXT NOT NULL,
    conflicting_event_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for schedule_changes
ALTER TABLE schedule_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_changes_select" ON schedule_changes FOR SELECT USING (true);
CREATE POLICY "schedule_changes_insert" ON schedule_changes FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_changes_delete" ON schedule_changes FOR DELETE USING (true);
