-- ==========================================================
-- INNOVISION — BUG HUNT (2026)
-- Complete Supabase PostgreSQL Schema & Security Policies
-- Department of Artificial Intelligence and Data Science
-- ==========================================================

-- 1. REGISTRATIONS TABLE (Compatible with existing INNOVISION website)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(255) DEFAULT 'Artificial Intelligence and Data Science',
    event_name VARCHAR(100) DEFAULT 'BUG HUNT',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant lookup on login
CREATE INDEX IF NOT EXISTS idx_registrations_reg_id ON public.registrations(registration_id);

-- 2. COMPETITION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.competition_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_settings',
    event_name VARCHAR(255) DEFAULT 'INNOVISION — BUG HUNT',
    subtitle VARCHAR(255) DEFAULT 'Find the Bug. Fix the Code. Beat the Clock.',
    department VARCHAR(255) DEFAULT 'Artificial Intelligence and Data Science',
    venue VARCHAR(100) DEFAULT 'LAB 4-A',
    event_date VARCHAR(100) DEFAULT '29-09-2026',
    event_time VARCHAR(100) DEFAULT '3:00 PM – 3:40 PM',
    active_round INT DEFAULT 1,
    allow_navigation BOOLEAN DEFAULT TRUE,
    copy_paste_allowed BOOLEAN DEFAULT FALSE,
    randomize_questions BOOLEAN DEFAULT FALSE,
    tab_switch_limit INT DEFAULT 3,
    leaderboard_public BOOLEAN DEFAULT FALSE,
    show_answers_after_competition BOOLEAN DEFAULT FALSE,
    tie_breaker_rules TEXT DEFAULT '1. Higher Total Score -> 2. Higher Final Round Score -> 3. Tie-breaker Question Score -> 4. Earliest Submission Timestamp',
    announcements JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROUNDS TABLE
CREATE TABLE IF NOT EXISTS public.rounds (
    round_number INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    total_questions INT NOT NULL,
    total_marks INT NOT NULL,
    status VARCHAR(50) DEFAULT 'LOCKED', -- 'LOCKED', 'READY', 'LIVE', 'PAUSED', 'COMPLETED'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id VARCHAR(50) PRIMARY KEY,
    round_id INT REFERENCES public.rounds(round_number) ON DELETE CASCADE,
    question_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    difficulty VARCHAR(50) DEFAULT 'Easy',
    marks INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    buggy_code TEXT NOT NULL,
    solution_code TEXT, -- SECURE: Never sent to public client
    explanation TEXT,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PARTICIPANT SESSIONS & SCORES
CREATE TABLE IF NOT EXISTS public.participant_sessions (
    registration_id VARCHAR(50) PRIMARY KEY REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- 'NOT_STARTED', 'LOGGED_IN', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'DISQUALIFIED', 'LOCKED'
    current_round INT DEFAULT 1,
    round_1_score INT DEFAULT 0,
    round_2_score INT DEFAULT 0,
    round_3_score INT DEFAULT 0,
    tie_breaker_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    is_finalist BOOLEAN DEFAULT FALSE,
    round_1_started_at TIMESTAMPTZ,
    round_1_deadline_at TIMESTAMPTZ,
    round_1_submitted_at TIMESTAMPTZ,
    round_2_started_at TIMESTAMPTZ,
    round_2_deadline_at TIMESTAMPTZ,
    round_2_submitted_at TIMESTAMPTZ,
    round_3_started_at TIMESTAMPTZ,
    round_3_deadline_at TIMESTAMPTZ,
    round_3_submitted_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    suspicious_count INT DEFAULT 0,
    ip_address VARCHAR(100),
    user_agent TEXT
);

-- 6. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(50) REFERENCES public.participant_sessions(registration_id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES public.questions(id) ON DELETE CASCADE,
    round_id INT NOT NULL,
    submitted_code TEXT NOT NULL,
    score INT DEFAULT 0,
    test_results JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'submitted', -- 'draft', 'submitted', 'evaluated', 'correct', 'incorrect', 'partial'
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    execution_time_ms INT DEFAULT 0
);

-- 7. AUDIT & ANTI-CHEATING LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'TAB_SWITCH', 'FULLSCREEN_EXIT', 'BLUR', 'PASTE_ATTEMPT', 'DEVTOOLS', 'LOGIN', 'SUBMIT', 'LOCK'
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read settings and active rounds
CREATE POLICY "Public can view settings" ON public.competition_settings FOR SELECT USING (true);
CREATE POLICY "Public can view rounds" ON public.rounds FOR SELECT USING (true);

-- Authenticated Admin full access
CREATE POLICY "Service role full access settings" ON public.competition_settings USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access rounds" ON public.rounds USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access questions" ON public.questions USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access participants" ON public.participant_sessions USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access submissions" ON public.submissions USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access audit_logs" ON public.audit_logs USING (auth.role() = 'service_role');

-- Enable Realtime publication for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.participant_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_settings;
