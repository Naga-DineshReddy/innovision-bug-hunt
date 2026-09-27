export type ParticipantStatus =
  | "NOT_STARTED"
  | "LOGGED_IN"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "DISQUALIFIED"
  | "LOCKED";

export type RoundStatus = "LOCKED" | "READY" | "LIVE" | "PAUSED" | "COMPLETED";

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  description?: string;
}

export interface Question {
  id: string;
  round_id: number;
  question_number: number;
  title: string;
  description: string;
  language: "python" | "c" | "cpp" | "java";
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  buggy_code: string;
  solution_code?: string;
  test_cases: TestCase[];
  category: string;
  explanation?: string;
  is_active: boolean;
}

export interface Participant {
  registration_id: string;
  student_name: string;
  email: string;
  department: string;
  event: string;
  status: ParticipantStatus;
  current_round: number;
  round_1_score: number;
  round_2_score: number;
  round_3_score: number;
  tie_breaker_score: number;
  total_score: number;
  is_finalist: boolean;
  round_1_started_at: string | null;
  round_1_deadline_at: string | null;
  round_1_submitted_at: string | null;
  round_2_started_at: string | null;
  round_2_deadline_at: string | null;
  round_2_submitted_at: string | null;
  round_3_started_at: string | null;
  round_3_deadline_at: string | null;
  round_3_submitted_at: string | null;
  last_active_at: string | null;
  suspicious_count: number;
  ip_address?: string;
}

export interface TestResultItem {
  test_id: string;
  passed: boolean;
  output: string;
  expected: string;
  is_hidden?: boolean;
  error?: string;
}

export interface Submission {
  id: string;
  participant_id: string;
  student_name?: string;
  question_id: string;
  question_title?: string;
  round_id: number;
  submitted_code: string;
  score: number;
  test_results: TestResultItem[];
  status: "draft" | "submitted" | "evaluated" | "correct" | "incorrect" | "partial";
  submitted_at: string;
  execution_time_ms?: number;
}

export interface RoundInfo {
  round_number: number;
  name: string;
  subtitle: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  status: RoundStatus;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  is_urgent: boolean;
}

export interface CompetitionSettings {
  event_name: string;
  subtitle: string;
  department: string;
  association: string;
  event_date: string;
  event_time: string;
  venue: string;
  active_round: number;
  allow_navigation: boolean;
  copy_paste_allowed: boolean;
  randomize_questions: boolean;
  tab_switch_limit: number;
  leaderboard_public: boolean;
  show_answers_after_competition: boolean;
  tie_breaker_rules: string;
  announcements: AnnouncementItem[];
}

export interface AuditLog {
  id: string;
  registration_id: string;
  student_name: string;
  event_type:
    | "TAB_SWITCH"
    | "FULLSCREEN_EXIT"
    | "BLUR"
    | "PASTE_ATTEMPT"
    | "DEVTOOLS"
    | "LOGIN"
    | "LOGOUT"
    | "SUBMIT"
    | "LOCK"
    | "UNLOCK";
  details: string;
  created_at: string;
}
