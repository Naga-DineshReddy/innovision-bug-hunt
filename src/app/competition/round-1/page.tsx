import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { getQuestionsForRound, getRounds, updateParticipant } from "@/lib/store";
import { CompetitionArena } from "@/components/CompetitionArena";

export const dynamic = "force-dynamic";

export default async function Round1Page() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const rounds = await getRounds();
  const round1 = rounds.find((r) => r.round_number === 1);

  if (!round1 || round1.status === "LOCKED") {
    redirect("/competition");
  }

  const now = Date.now();

  // If Round 1 was already submitted OR its server deadline has expired, prevent re-entry
  const isRound1Submitted = !!session.round_1_submitted_at;
  const isRound1Expired = !!(session.round_1_deadline_at && new Date(session.round_1_deadline_at).getTime() <= now);

  if (isRound1Submitted || isRound1Expired) {
    redirect("/competition/round-2");
  }

  // Get sanitized questions
  const questions = await getQuestionsForRound(1, true);

  // Initialize or fetch server deadline
  let deadlineAt = session.round_1_deadline_at;

  if (!deadlineAt) {
    const durationMs = round1.duration_minutes * 60 * 1000;
    const startedAt = new Date(now).toISOString();
    deadlineAt = new Date(now + durationMs).toISOString();

    await updateParticipant(session.registration_id, {
      round_1_started_at: startedAt,
      round_1_deadline_at: deadlineAt,
      status: "IN_PROGRESS",
      current_round: 1
    });
  }

  return (
    <CompetitionArena
      roundNumber={1}
      roundTitle="ROUND 1"
      roundSubtitle="BUG HUNT BASICS"
      questions={questions}
      participant={session}
      serverDeadlineAt={deadlineAt}
    />
  );
}
