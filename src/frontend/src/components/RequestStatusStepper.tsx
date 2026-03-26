import { RequestStatus } from "../backend";

const STEPS = [
  { status: RequestStatus.pending, label: "Pending" },
  { status: RequestStatus.accepted, label: "Accepted" },
  { status: RequestStatus.inProgress, label: "In Progress" },
  { status: RequestStatus.completed, label: "Completed" },
];

const ORDER = [
  RequestStatus.pending,
  RequestStatus.accepted,
  RequestStatus.inProgress,
  RequestStatus.completed,
];

export default function RequestStatusStepper({
  status,
}: { status: RequestStatus }) {
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div
            key={step.status}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? "bg-[#2FBF71] border-[#2FBF71] text-white"
                    : isCurrent
                      ? "bg-[#E0242A] border-[#E0242A] text-white"
                      : "bg-[#232A33] border-[#2B323C] text-[#788392]"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1 whitespace-nowrap ${
                  isCurrent
                    ? "text-[#E0242A] font-semibold"
                    : isCompleted
                      ? "text-[#2FBF71]"
                      : "text-[#788392]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 ${
                  idx < currentIdx ? "bg-[#2FBF71]" : "bg-[#2B323C]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
