import { NextResponse } from "next/server";
import {
  LearnTrackSlugSchema,
  buildTrackView,
  checkInTrack,
  loadLearnProgress,
  saveLearnProgress,
  undoCheckIn,
} from "@/lib/learn-progress";

export const runtime = "nodejs";

function todayFromRequest(req: Request, bodyDate?: string): string {
  if (bodyDate && /^\d{4}-\d{2}-\d{2}$/.test(bodyDate)) return bodyDate;
  const header = req.headers.get("x-client-today");
  if (header && /^\d{4}-\d{2}-\d{2}$/.test(header)) return header;
  // Fallback: Asia/Shanghai calendar date
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugRaw = url.searchParams.get("track") ?? "harness";
  const parsed = LearnTrackSlugSchema.safeParse(slugRaw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid track" }, { status: 400 });
  }
  const today = todayFromRequest(req, url.searchParams.get("today") ?? undefined);
  const progress = await loadLearnProgress();
  const view = buildTrackView(parsed.data, progress[parsed.data], today);
  return NextResponse.json({ today, view, progress });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    action?: string;
    track?: string;
    date?: string;
    note?: string;
    minutes?: number;
  };

  const slug = LearnTrackSlugSchema.safeParse(body.track);
  if (!slug.success) {
    return NextResponse.json({ error: "invalid track" }, { status: 400 });
  }

  const today = todayFromRequest(req, body.date);
  let progress = await loadLearnProgress();

  if (body.action === "check_in") {
    progress = checkInTrack(progress, slug.data, {
      date: today,
      note: body.note,
      minutes: body.minutes,
    });
    await saveLearnProgress(progress);
    const view = buildTrackView(slug.data, progress[slug.data], today);
    return NextResponse.json({ today, view, progress, unlockedNow: view.medals.filter((m) => m.earned) });
  }

  if (body.action === "undo_today") {
    progress = undoCheckIn(progress, slug.data, today);
    await saveLearnProgress(progress);
    const view = buildTrackView(slug.data, progress[slug.data], today);
    return NextResponse.json({ today, view, progress });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
