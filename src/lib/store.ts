import {
  Participant,
  Question,
  RoundInfo,
  CompetitionSettings,
  Submission,
  AuditLog
} from "@/types";
import { INITIAL_QUESTIONS } from "@/data/questions";
import { INITIAL_PARTICIPANTS } from "@/data/participants";
import { INITIAL_ROUNDS, INITIAL_SETTINGS } from "@/data/competition";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { evaluateStudentCode } from "@/lib/evaluator";

// Global singleton state so memory persists across dev hot reloads
interface GlobalBugHuntState {
  participants: Map<string, Participant>;
  questions: Map<string, Question>;
  rounds: Map<number, RoundInfo>;
  settings: CompetitionSettings;
  submissions: Submission[];
  auditLogs: AuditLog[];
}

declare global {
  // eslint-disable-next-line no-var
  var __BUG_HUNT_STORE__: GlobalBugHuntState | undefined;
}

function getStore(): GlobalBugHuntState {
  if (!globalThis.__BUG_HUNT_STORE__) {
    const participantsMap = new Map<string, Participant>();
    for (const p of INITIAL_PARTICIPANTS) {
      participantsMap.set(p.registration_id.toUpperCase(), { ...p });
    }

    const questionsMap = new Map<string, Question>();
    for (const q of INITIAL_QUESTIONS) {
      questionsMap.set(q.id, { ...q });
    }

    const roundsMap = new Map<number, RoundInfo>();
    for (const r of INITIAL_ROUNDS) {
      roundsMap.set(r.round_number, { ...r });
    }

    globalThis.__BUG_HUNT_STORE__ = {
      participants: participantsMap,
      questions: questionsMap,
      rounds: roundsMap,
      settings: { ...INITIAL_SETTINGS },
      submissions: [],
      auditLogs: []
    };
  }

  return globalThis.__BUG_HUNT_STORE__;
}

// ==========================================
// PARTICIPANT & REGISTRATION QUERIES
// ==========================================

export async function verifyRegistrationId(regId: string): Promise<Participant | null> {
  const cleanId = regId.trim().toUpperCase();

  // 1. If Supabase is configured, check Supabase first
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("registrations")
        .select(`
          *,
          registration_members (*)
        `)
        .ilike("registration_id", cleanId)
        .maybeSingle();

      if (!error && data) {
        // Extract student details: directly or from linked registration_members
        const membersList = (data as any).registration_members;
        const member = Array.isArray(membersList) && membersList.length > 0 ? membersList[0] : null;

        const studentName = (data as any).student_name || member?.full_name || (data as any).team_name || "Contestant";
        const email = (data as any).email || member?.email || "";
        const department = (data as any).department || member?.department || "Artificial Intelligence and Data Science";

        // Check if participant_sessions record exists
        const { data: sessionData } = await supabaseAdmin
          .from("participant_sessions")
          .select("*")
          .eq("registration_id", data.registration_id)
          .maybeSingle();

        if (sessionData) {
          const r1 = Number(sessionData.round_1_score) || 0;
          const r2 = Number(sessionData.round_2_score) || 0;
          const r3 = Number(sessionData.round_3_score) || 0;
          const tb = Number(sessionData.tie_breaker_score) || 0;
          const total =
            sessionData.total_score != null && !isNaN(Number(sessionData.total_score)) && Number(sessionData.total_score) > 0
              ? Number(sessionData.total_score)
              : r1 + r2 + r3 + tb;

          const participantObj: Participant = {
            ...(sessionData as Participant),
            student_name: sessionData.student_name || studentName,
            email: sessionData.email || email,
            department: department,
            event: "BUG HUNT",
            round_1_score: r1,
            round_2_score: r2,
            round_3_score: r3,
            tie_breaker_score: tb,
            total_score: total
          };
          const store = getStore();
          store.participants.set(cleanId, participantObj);
          return participantObj;
        }

        // Return initialized participant
        const initialParticipant: Participant = {
          registration_id: data.registration_id,
          student_name: studentName,
          email: email,
          department: department,
          event: "BUG HUNT",
          status: "LOGGED_IN",
          current_round: 1,
          round_1_score: 0,
          round_2_score: 0,
          round_3_score: 0,
          tie_breaker_score: 0,
          total_score: 0,
          is_finalist: false,
          round_1_started_at: null,
          round_1_deadline_at: null,
          round_1_submitted_at: null,
          round_2_started_at: null,
          round_2_deadline_at: null,
          round_2_submitted_at: null,
          round_3_started_at: null,
          round_3_deadline_at: null,
          round_3_submitted_at: null,
          last_active_at: new Date().toISOString(),
          suspicious_count: 0
        };

        const store = getStore();
        store.participants.set(cleanId, initialParticipant);
        return initialParticipant;
      }
    } catch (e) {
      console.warn("Supabase registration lookup fallback to memory store:", e);
    }
  }

  // 2. Memory store lookup (with 80 pre-seeded participants)
  const store = getStore();
  const participant = store.participants.get(cleanId);
  return participant ? { ...participant } : null;
}

export async function getParticipant(regId: string): Promise<Participant | null> {
  return verifyRegistrationId(regId);
}

export async function getAllParticipants(): Promise<Participant[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // 1. Fetch sessions
      const { data: sessionData } = await supabaseAdmin
        .from("participant_sessions")
        .select("*")
        .order("registration_id", { ascending: true });

      const sessionMap = new Map<string, any>();
      if (sessionData) {
        for (const s of sessionData) {
          sessionMap.set(s.registration_id.toUpperCase(), s);
        }
      }

      // 2. Fetch registrations with members
      const { data: regData, error: regError } = await supabaseAdmin
        .from("registrations")
        .select(`
          id,
          registration_id,
          team_name,
          status,
          registration_members (
            full_name,
            roll_number,
            email,
            department
          )
        `)
        .order("registration_id", { ascending: true });

      if (!regError && regData && regData.length > 0) {
        const participants: Participant[] = regData.map((reg) => {
          const regId = (reg.registration_id || "").toUpperCase();
          const session = sessionMap.get(regId);
          const membersList = (reg as any).registration_members;
          const member = Array.isArray(membersList) && membersList.length > 0 ? membersList[0] : null;

          const studentName = member?.full_name || reg.team_name || "Contestant";
          const email = member?.email || "";
          const department = member?.department || "Artificial Intelligence and Data Science";

          if (session) {
            const r1 = Number(session.round_1_score) || 0;
            const r2 = Number(session.round_2_score) || 0;
            const r3 = Number(session.round_3_score) || 0;
            const tb = Number(session.tie_breaker_score) || 0;
            const total =
              session.total_score != null && !isNaN(Number(session.total_score)) && Number(session.total_score) > 0
                ? Number(session.total_score)
                : r1 + r2 + r3 + tb;

            return {
              ...session,
              student_name: session.student_name || studentName,
              email: session.email || email,
              department: session.department || department,
              round_1_score: r1,
              round_2_score: r2,
              round_3_score: r3,
              tie_breaker_score: tb,
              total_score: total
            };
          }

          return {
            registration_id: regId,
            student_name: studentName,
            email: email,
            department: department,
            event: "BUG HUNT",
            status: "NOT_STARTED",
            current_round: 1,
            round_1_score: 0,
            round_2_score: 0,
            round_3_score: 0,
            tie_breaker_score: 0,
            total_score: 0,
            is_finalist: false,
            round_1_started_at: null,
            round_1_deadline_at: null,
            round_1_submitted_at: null,
            round_2_started_at: null,
            round_2_deadline_at: null,
            round_2_submitted_at: null,
            round_3_started_at: null,
            round_3_deadline_at: null,
            round_3_submitted_at: null,
            last_active_at: new Date().toISOString(),
            suspicious_count: 0
          };
        });

        return participants;
      } else if (sessionData && sessionData.length > 0) {
        return sessionData as Participant[];
      }
    } catch (e) {
      console.warn("Supabase fetch all participants fallback to memory store:", e);
    }
  }

  const store = getStore();
  return Array.from(store.participants.values()).sort((a, b) =>
    a.registration_id.localeCompare(b.registration_id)
  );
}

export async function updateParticipant(
  regId: string,
  updates: Partial<Participant>
): Promise<Participant | null> {
  const cleanId = regId.trim().toUpperCase();
  const store = getStore();
  let existing = store.participants.get(cleanId);

  if (!existing) {
    const found = await verifyRegistrationId(cleanId);
    if (found) {
      existing = found;
      store.participants.set(cleanId, existing);
    }
  }

  if (!existing) return null;

  const r1 = Number(updates.round_1_score !== undefined ? updates.round_1_score : existing.round_1_score) || 0;
  const r2 = Number(updates.round_2_score !== undefined ? updates.round_2_score : existing.round_2_score) || 0;
  const r3 = Number(updates.round_3_score !== undefined ? updates.round_3_score : existing.round_3_score) || 0;
  const tb = Number(updates.tie_breaker_score !== undefined ? updates.tie_breaker_score : existing.tie_breaker_score) || 0;
  const total = updates.total_score !== undefined && !isNaN(Number(updates.total_score)) ? Number(updates.total_score) : (r1 + r2 + r3 + tb);

  const updated: Participant = {
    ...existing,
    ...updates,
    round_1_score: r1,
    round_2_score: r2,
    round_3_score: r3,
    tie_breaker_score: tb,
    total_score: total,
    last_active_at: new Date().toISOString()
  };

  store.participants.set(cleanId, updated);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const dbPayload = {
        registration_id: updated.registration_id,
        student_name: updated.student_name,
        email: updated.email,
        status: updated.status,
        current_round: updated.current_round,
        round_1_score: updated.round_1_score,
        round_2_score: updated.round_2_score,
        round_3_score: updated.round_3_score,
        total_score: updated.total_score,
        is_finalist: updated.is_finalist,
        round_1_started_at: updated.round_1_started_at,
        round_1_deadline_at: updated.round_1_deadline_at,
        round_1_submitted_at: updated.round_1_submitted_at,
        round_2_started_at: updated.round_2_started_at,
        round_2_deadline_at: updated.round_2_deadline_at,
        round_2_submitted_at: updated.round_2_submitted_at,
        round_3_started_at: updated.round_3_started_at,
        round_3_deadline_at: updated.round_3_deadline_at,
        round_3_submitted_at: updated.round_3_submitted_at,
        last_active_at: updated.last_active_at,
        suspicious_count: updated.suspicious_count
      };

      const { error: upsertErr } = await supabaseAdmin
        .from("participant_sessions")
        .upsert(dbPayload, { onConflict: "registration_id" });

      if (upsertErr) {
        console.error("Supabase upsert error in updateParticipant:", upsertErr);
      }
    } catch (e) {
      console.warn("Supabase update participant fallback:", e);
    }
  }

  return { ...updated };
}

// ==========================================
// ROUND QUERIES & CONTROLS
// ==========================================

export async function getRounds(): Promise<RoundInfo[]> {
  const store = getStore();
  return Array.from(store.rounds.values()).sort((a, b) => a.round_number - b.round_number);
}

export async function updateRound(
  roundNumber: number,
  updates: Partial<RoundInfo>
): Promise<RoundInfo | null> {
  const store = getStore();
  const round = store.rounds.get(roundNumber);
  if (!round) return null;

  const updated: RoundInfo = { ...round, ...updates };
  store.rounds.set(roundNumber, updated);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from("rounds")
        .upsert(updated, { onConflict: "round_number" });
    } catch (e) {
      console.warn("Supabase round update error:", e);
    }
  }

  return { ...updated };
}

// ==========================================
// QUESTIONS (Sanitized for students!)
// ==========================================

export async function getQuestionsForRound(
  roundId: number,
  isStudent = true
): Promise<Question[]> {
  const store = getStore();
  const list = Array.from(store.questions.values()).filter(
    (q) => q.round_id === roundId && q.is_active
  );

  list.sort((a, b) => a.question_number - b.question_number);

  if (isStudent) {
    // SECURITY: Strip solution_code and hidden test cases for students
    return list.map((q) => ({
      ...q,
      solution_code: undefined,
      test_cases: q.test_cases.filter((tc) => !tc.is_hidden)
    }));
  }

  return list;
}

export async function getQuestionById(
  id: string,
  isStudent = true
): Promise<Question | null> {
  const store = getStore();
  const q = store.questions.get(id);
  if (!q) return null;

  if (isStudent) {
    return {
      ...q,
      solution_code: undefined,
      test_cases: q.test_cases.filter((tc) => !tc.is_hidden)
    };
  }

  return { ...q };
}

export async function saveQuestion(question: Question): Promise<Question> {
  const store = getStore();
  store.questions.set(question.id, { ...question });
  return { ...question };
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const store = getStore();
  return store.questions.delete(id);
}

// ==========================================
// SUBMISSIONS & CODE EVALUATION
// ==========================================

export async function submitQuestionCode(params: {
  participantId: string;
  questionId: string;
  roundId: number;
  submittedCode: string;
  isAutoSave?: boolean;
}): Promise<{
  submission: Submission;
  evalResult: ReturnType<typeof evaluateStudentCode>;
}> {
  const store = getStore();
  const participant = store.participants.get(params.participantId.toUpperCase());
  const question = store.questions.get(params.questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  // Evaluate against all test cases (both public and hidden)
  const evalResult = evaluateStudentCode(params.submittedCode, question);

  const submission: Submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    participant_id: params.participantId.toUpperCase(),
    student_name: participant ? participant.student_name : "Participant",
    question_id: params.questionId,
    question_title: question.title,
    round_id: params.roundId,
    submitted_code: params.submittedCode,
    score: evalResult.score,
    test_results: evalResult.testResults,
    status: params.isAutoSave ? "draft" : evalResult.status,
    submitted_at: new Date().toISOString(),
    execution_time_ms: Math.floor(Math.random() * 40) + 15
  };

  // Replace or add submission
  const existingIdx = store.submissions.findIndex(
    (s) =>
      s.participant_id === submission.participant_id &&
      s.question_id === submission.question_id
  );

  if (existingIdx >= 0) {
    store.submissions[existingIdx] = submission;
  } else {
    store.submissions.push(submission);
  }

  // Update participant score for this round if it's an official submission
  if (!params.isAutoSave && participant) {
    // Recompute total score for this round by summing best submissions for questions in this round
    const participantSubs = store.submissions.filter(
      (s) => s.participant_id === participant.registration_id && s.round_id === params.roundId
    );
    const roundScore = participantSubs.reduce((acc, curr) => acc + curr.score, 0);

    const scoreField =
      params.roundId === 1
        ? "round_1_score"
        : params.roundId === 2
        ? "round_2_score"
        : "round_3_score";

    await updateParticipant(participant.registration_id, {
      [scoreField]: roundScore
    });

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from("submissions").insert({
          registration_id: submission.participant_id,
          student_name: submission.student_name,
          round_id: submission.round_id,
          question_id: submission.question_id,
          submitted_code: submission.submitted_code,
          tests_passed: evalResult.testResults.filter((t) => t.passed).length,
          total_tests: evalResult.testResults.length,
          score: submission.score,
          submitted_at: submission.submitted_at
        });
      } catch (e) {
        console.warn("Supabase submission insert fallback:", e);
      }
    }
  }

  return { submission, evalResult };
}

export async function getSubmissions(participantId?: string): Promise<Submission[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(500);

      if (participantId) {
        query = query.ilike("registration_id", participantId.trim());
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          participant_id: d.registration_id,
          student_name: d.student_name,
          question_id: d.question_id,
          question_title: d.question_id,
          round_id: d.round_id,
          submitted_code: d.submitted_code,
          score: d.score,
          test_results: [],
          status: d.score > 0 ? "correct" : "incorrect",
          submitted_at: d.submitted_at,
          execution_time_ms: 22
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch submissions fallback:", e);
    }
  }

  const store = getStore();
  let subs = [...store.submissions];
  if (participantId) {
    subs = subs.filter((s) => s.participant_id === participantId.toUpperCase());
  }
  return subs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
}

// ==========================================
// AUDIT LOGS & ANTI-CHEATING
// ==========================================

export async function logAuditEvent(event: {
  registration_id: string;
  student_name?: string;
  event_type: AuditLog["event_type"];
  details: string;
}): Promise<AuditLog> {
  const store = getStore();
  const participant = store.participants.get(event.registration_id.toUpperCase());

  const auditLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    registration_id: event.registration_id.toUpperCase(),
    student_name: participant ? participant.student_name : event.student_name || "Unknown",
    event_type: event.event_type,
    details: event.details,
    created_at: new Date().toISOString()
  };

  store.auditLogs.unshift(auditLog);

  // If suspicious, increment suspicious count
  if (participant && ["TAB_SWITCH", "FULLSCREEN_EXIT", "BLUR", "DEVTOOLS"].includes(event.event_type)) {
    const newCount = participant.suspicious_count + 1;
    await updateParticipant(participant.registration_id, {
      suspicious_count: newCount
    });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin.from("audit_logs").insert(auditLog);
    } catch (e) {
      console.warn("Supabase audit log insert error:", e);
    }
  }

  return auditLog;
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const store = getStore();
  return store.auditLogs.slice(0, limit);
}

// ==========================================
// COMPETITION SETTINGS
// ==========================================

export async function getCompetitionSettings(): Promise<CompetitionSettings> {
  const store = getStore();
  return { ...store.settings };
}

export async function updateCompetitionSettings(
  updates: Partial<CompetitionSettings>
): Promise<CompetitionSettings> {
  const store = getStore();
  store.settings = { ...store.settings, ...updates };
  return { ...store.settings };
}

// ==========================================
// FINALIST SELECTION & ROUND CONTROLS
// ==========================================

export async function setFinalists(regIds: string[]): Promise<number> {
  const store = getStore();
  const targetSet = new Set(regIds.map((id) => id.toUpperCase()));
  let count = 0;

  for (const [id, p] of store.participants.entries()) {
    const isTarget = targetSet.has(id);
    if (p.is_finalist !== isTarget) {
      store.participants.set(id, { ...p, is_finalist: isTarget });
      count++;
    }
  }

  return count;
}

export async function resetRound(roundNumber: number): Promise<boolean> {
  const store = getStore();
  // Clear submissions for this round
  store.submissions = store.submissions.filter((s) => s.round_id !== roundNumber);

  // Reset round score for all participants
  const scoreField =
    roundNumber === 1 ? "round_1_score" : roundNumber === 2 ? "round_2_score" : "round_3_score";
  const startField =
    roundNumber === 1 ? "round_1_started_at" : roundNumber === 2 ? "round_2_started_at" : "round_3_started_at";
  const deadlineField =
    roundNumber === 1 ? "round_1_deadline_at" : roundNumber === 2 ? "round_2_deadline_at" : "round_3_deadline_at";
  const submittedField =
    roundNumber === 1 ? "round_1_submitted_at" : roundNumber === 2 ? "round_2_submitted_at" : "round_3_submitted_at";

  for (const [id, p] of store.participants.entries()) {
    store.participants.set(id, {
      ...p,
      [scoreField]: 0,
      [startField]: null,
      [deadlineField]: null,
      [submittedField]: null,
      total_score: p.total_score - (p[scoreField] || 0)
    });
  }

  // Set round status to READY
  const r = store.rounds.get(roundNumber);
  if (r) {
    store.rounds.set(roundNumber, { ...r, status: "READY", started_at: null, ended_at: null });
  }

  return true;
}
