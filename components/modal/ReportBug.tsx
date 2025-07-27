"use client";

import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

export const ReportBug = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide a title and description.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Reporting bug...");
    try {
      const res = await fetch("/api/bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Bug reported! Thank you.", { id: toastId });
        setDescription("");
        setTitle("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || "Failed to report bug", { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to report bug", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="bg-white max-w-sm w-full">
      <DialogHeader>
        <DialogTitle>Report a Bug</DialogTitle>
        <DialogDescription>
          Found an issue? Please describe it below so we can fix it!
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="bug-title" className="text-sm font-medium">
            Bug Title
          </label>
          <input
            id="bug-title"
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary (e.g. Crash on login)"
            maxLength={100}
            required
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bug-description" className="text-sm font-medium">
            Bug Description
          </label>
          <textarea
            id="bug-description"
            className="border rounded px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-400 focus:outline-none resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bug in detail..."
            maxLength={1000}
            required
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
