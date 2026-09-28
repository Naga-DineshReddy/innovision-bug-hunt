import { RoundInfo, CompetitionSettings } from "@/types";

export const INITIAL_ROUNDS: RoundInfo[] = [
  {
    round_number: 1,
    name: "ROUND 1",
    subtitle: "EASY: BUG HUNT BASICS",
    duration_minutes: 10,
    total_questions: 8,
    total_marks: 20,
    status: "LIVE"
  },
  {
    round_number: 2,
    name: "ROUND 2",
    subtitle: "MODERATE: DEBUGGING CHALLENGE",
    duration_minutes: 10,
    total_questions: 5,
    total_marks: 30,
    status: "READY"
  },
  {
    round_number: 3,
    name: "ROUND 3",
    subtitle: "HARD: FINAL BUG HUNT",
    duration_minutes: 10,
    total_questions: 3,
    total_marks: 50,
    status: "READY"
  }
];

export const INITIAL_SETTINGS: CompetitionSettings = {
  event_name: "INNOVISION — BUG HUNT",
  subtitle: "Find the Bug. Fix the Code. Beat the Clock.",
  department: "Artificial Intelligence and Data Science",
  association: "INNOVISION",
  event_date: "29-09-2026",
  event_time: "3:00 PM – 3:40 PM",
  venue: "LAB 4-A",
  active_round: 1,
  allow_navigation: true,
  copy_paste_allowed: false,
  randomize_questions: false,
  tab_switch_limit: 3,
  leaderboard_public: false,
  show_answers_after_competition: false,
  tie_breaker_rules: "1. Higher Total Score (out of 100) -> 2. Higher Round 3 (Hard) Score -> 3. Higher Round 2 Score -> 4. Earliest Submission Timestamp",
  announcements: [
    {
      id: "ann-1",
      title: "Welcome to INNOVISION BUG HUNT 2026",
      message: "Competition Schedule: Round 1 (10 mins) → Round 2 (10 mins) → Round 3 (10 mins). All registered students participate in all three rounds!",
      timestamp: "3:00 PM",
      is_urgent: false
    },
    {
      id: "ann-2",
      title: "Round 1 (Easy) is LIVE",
      message: "Duration: 10 minutes • 8 questions • 20 marks. At the deadline, Round 1 auto-submits and Round 2 unlocks automatically.",
      timestamp: "3:00 PM",
      is_urgent: true
    }
  ]
};
