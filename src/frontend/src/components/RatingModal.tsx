import { Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface Props {
  actor: backendInterface;
  requestId: bigint;
  providerId: bigint;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RatingModal({
  actor,
  requestId,
  providerId,
  onClose,
  onSubmit,
}: Props) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await actor.submitRating({
        requestId,
        providerId,
        score: BigInt(score),
        comment,
      });
      toast.success("Rating submitted!");
      onSubmit();
    } catch {
      toast.error("Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1B1F26] border border-[#2B323C] rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-[#2B323C]">
          <h2 className="text-lg font-bold text-[#E9EEF5]">
            Rate Your Experience
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#788392] hover:text-[#E9EEF5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button type="button" key={s} onClick={() => setScore(s)}>
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= score
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-[#2B323C]"
                  }`}
                />
              </button>
            ))}
          </div>
          <label
            htmlFor="rating-comment"
            className="block text-sm text-[#A7B0BC]"
          >
            Comment
          </label>
          <textarea
            id="rating-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors resize-none text-sm"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
