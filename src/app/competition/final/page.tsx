import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/auth";
import { getQuestionsForRound, getRounds, updateParticipant } from "@/lib/store";
import { CompetitionArena } from "@/components/CompetitionArena";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinalRoundPage() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const now = Date.now();

  // Prerequisite: Round 2 must be completed or expired
  const isRound2Submitted = !!session.round_2_submitted_at;
  const isRound2Expired = !!(session.round_2_deadline_at && new Date(session.round_2_deadline_at).getTime() <= now);

  if (!isRound2Submitted && !isRound2Expired) {
    redirect("/competition/round-2");
  }

  // If Round 3 was already submitted OR its server deadline has expired, prevent re-entry
  const isRound3Submitted = !!session.round_3_submitted_at;
  const isRound3Expired = !!(session.round_3_deadline_at && new Date(session.round_3_deadline_at).getTime() <= now);

  if (isRound3Submitted || isRound3Expired) {
    redirect("/competition/result");
  }

  const rounds = await getRounds();
  const finalRound = rounds.find((r) => r.round_number === 3);
  const durationMinutes = finalRound?.duration_minutes ?? 15;

  const questions = await getQuestionsForRound(3, true);

  let deadlineAt = session.round_3_deadline_at;

  if (!deadlineAt) {
    const durationMs = durationMinutes * 60 * 1000;
    const startedAt = new Date(now).toISOString();
    deadlineAt = new Date(now + durationMs).toISOString();

    await updateParticipant(session.registration_id, {
      round_3_started_at: startedAt,
      round_3_deadline_at: deadlineAt,
      status: "IN_PROGRESS",
      current_round: 3
    });
  }

  return (
    <CompetitionArena
      roundNumber={3}
      roundTitle="ROUND 3"
      roundSubtitle="HARD: FINAL BUG HUNT"
      questions={questions}
      participant={session}
      serverDeadlineAt={deadlineAt}
    />
  );
}
