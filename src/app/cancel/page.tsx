"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CancelSubscriptionPage() {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);

  const handleNext = () => setStep(step + 1);

  const handleCancel = () => {
    setIsCancelled(true);
  };

  if (isCancelled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h2 className="mb-2 text-2xl font-semibold text-zinc-900">Subscription Cancelled</h2>
          <p className="mb-6 text-sm text-zinc-500">
            Your subscription has been successfully cancelled. You will have access until the end of your current billing period.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="p-6">
          <h1 className="mb-2 text-xl font-semibold text-zinc-900">Cancel Subscription</h1>
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="mb-6 text-sm text-zinc-500">
                Are you sure you want to cancel your Pro plan? You&apos;ll lose access to premium features immediately.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleNext}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Continue to Cancel
                </button>
                <Link
                  href="/"
                  className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  Keep my Subscription
                </Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="mb-4 text-sm text-zinc-600">Please tell us why you are leaving:</p>
              
              <div className="mb-6 space-y-2">
                {["Too expensive", "Not using it enough", "Missing features", "Found an alternative", "Other"].map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                      reason === r ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-zinc-900">{r}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!reason}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                >
                  Next step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <p className="text-sm text-rose-800">
                    <strong>Final Warning:</strong> This action cannot be undone. All your saved data and settings will be permanently lost at the end of the billing cycle.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCancel}
                  className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
