import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { getQuestionsForRound, getRounds, updateParticipant } from "@/lib/store";
import { CompetitionArena } from "@/components/CompetitionArena";

export const dynamic = "force-dynamic";

export default async function Round2Page() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const rounds = await getRounds();
  const round2 = rounds.find((r) => r.round_number === 2);
  const durationMinutes = round2?.duration_minutes ?? 10;

  const now = Date.now();

  // Prerequisite: Round 1 must be completed or expired
  const isRound1Submitted = !!session.round_1_submitted_at;
  const isRound1Expired = !!(session.round_1_deadline_at && new Date(session.round_1_deadline_at).getTime() <= now);

  if (!isRound1Submitted && !isRound1Expired) {
    redirect("/competition/round-1");
  }

  // If Round 2 was already submitted OR its server deadline has expired, prevent re-entry
  const isRound2Submitted = !!session.round_2_submitted_at;
  const isRound2Expired = !!(session.round_2_deadline_at && new Date(session.round_2_deadline_at).getTime() <= now);

  if (isRound2Submitted || isRound2Expired) {
    redirect("/competition/final");
  }

  const questions = await getQuestionsForRound(2, true);

  let deadlineAt = session.round_2_deadline_at;

  if (!deadlineAt) {
    const durationMs = durationMinutes * 60 * 1000;
    const startedAt = new Date(now).toISOString();
    deadlineAt = new Date(now + durationMs).toISOString();

    await updateParticipant(session.registration_id, {
      round_2_started_at: startedAt,
      round_2_deadline_at: deadlineAt,
      status: "IN_PROGRESS",
      current_round: 2
    });
  }

  return (
    <CompetitionArena
      roundNumber={2}
      roundTitle="ROUND 2"
      roundSubtitle="DEBUGGING CHALLENGE"
      questions={questions}
      participant={session}
      serverDeadlineAt={deadlineAt}
    />
  );
}
