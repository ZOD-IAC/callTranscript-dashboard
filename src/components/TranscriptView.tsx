import { Highlight } from "@/components/Highlight";

const SPEAKER_REGEX = /^(Agent|Caller):\s*/;

export function TranscriptView({ transcript, searchTerm }: { transcript: string; searchTerm: string }) {
  const lines = transcript.split("\n").filter((l) => l.trim().length > 0);

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const match = line.match(SPEAKER_REGEX);
        const speaker = match?.[1];
        const rest = match ? line.slice(match[0].length) : line;

        return (
          <p key={i} className="text-sm leading-relaxed">
            {speaker && (
              <span className={speaker === "Agent" ? "font-bold text-slate-900" : "font-bold text-blue-700"}>
                {speaker}:{" "}
              </span>
            )}
            <Highlight text={rest} term={searchTerm} />
          </p>
        );
      })}
    </div>
  );
}