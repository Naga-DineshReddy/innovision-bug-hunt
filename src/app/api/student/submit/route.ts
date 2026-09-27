import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { submitQuestionCode, getQuestionById, updateParticipant, logAuditEvent } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    if (session.status === "DISQUALIFIED" || session.status === "LOCKED") {
      return NextResponse.json(
        { error: "Account action suspended. Contact coordinator." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { questionId, roundId, submittedCode, isAutoSave } = body;

    if (!questionId || !roundId || submittedCode === undefined) {
      return NextResponse.json({ error: "Missing submission parameters" }, { status: 400 });
    }

    // Verify deadline
    const deadlineField =
      roundId === 1
        ? "round_1_deadline_at"
        : roundId === 2
        ? "round_2_deadline_at"
        : "round_3_deadline_at";

    const deadlineStr = session[deadlineField];
    if (deadlineStr) {
      const deadline = new Date(deadlineStr).getTime();
      const now = Date.now();
      // Allow a 5-second grace window for network lag
      if (now > deadline + 5000) {
        return NextResponse.json(
          {
            error: "Time's up! The deadline for this round has passed. No further submissions accepted.",
            isExpired: true
          },
          { status: 403 }
        );
      }
    }

    const question = await getQuestionById(questionId, false); // Get full question for evaluation
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { submission, evalResult } = await submitQuestionCode({
      participantId: session.registration_id,
      questionId,
      roundId: Number(roundId),
      submittedCode: String(submittedCode),
      isAutoSave: Boolean(isAutoSave)
    });

    if (!isAutoSave) {
      await logAuditEvent({
        registration_id: session.registration_id,
        student_name: session.student_name,
        event_type: "SUBMIT",
        details: `Submitted Question ${question.question_number} (${question.title}) - Score: ${evalResult.score}/${question.marks}`
      });
    }

    // Return sanitized outcome (never show hidden test inputs)
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score: evalResult.score,
      maxMarks: evalResult.maxMarks,
      allPassed: evalResult.allPassed,
      status: evalResult.status,
      feedback: evalResult.feedback,
      // Public test cases only for student UI
      testResults: evalResult.testResults.map((t) => ({
        test_id: t.test_id,
        passed: t.passed,
        output: t.output,
        expected: t.expected,
        is_hidden: t.is_hidden,
        error: t.error
      }))
    });
  } catch (error: unknown) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error during code submission" },
      { status: 500 }
    );
  }
}
