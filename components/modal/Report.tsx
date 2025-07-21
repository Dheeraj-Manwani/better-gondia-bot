"use client";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const REPORT_OPTIONS = [
  {
    label: "Inappropriate or offensive content",
    value: "INAPPROPRIATE_CONTENT",
  },
  {
    label: "False or misleading information",
    value: "MISLEADING_OR_FALSE_INFO",
  },
  {
    label: "Spam or duplicate post",
    value: "SPAM_OR_DUPLICATE",
  },
  {
    label: "Privacy violation",
    value: "PRIVACY_VIOLATION",
  },
  {
    label: "Harassment or hate speech",
    value: "HARASSMENT_OR_HATE_SPEECH",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

type ReportFormValues = {
  reason: string;
  otherReason?: string;
};

export const Report = () => {
  const form = useForm<ReportFormValues>({
    defaultValues: { reason: "" },
  });
  const reason = form.watch("reason");

  const onSubmit = (data: ReportFormValues) => {
    console.log("Selected reason:", data.reason);
    if (data.reason === "OTHER") {
      console.log("Other reason:", data.otherReason);
    }
  };
  return (
    <DialogContent className="bg-white">
      <DialogHeader>
        <DialogTitle className="flex gap-1 justify-center items-center font-bold text-center text-gray-800 mb-2">
          <Image src={logo} height={30} width={30} alt="logo" />{" "}
          <span> About This Platform</span>
        </DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormItem>
              <FormLabel className="block mb-2">Select a reason</FormLabel>
              <div className="flex flex-col gap-2">
                {REPORT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${
                      form.watch("reason") === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <Controller
                      name="reason"
                      control={form.control}
                      rules={{ required: "Please select a reason" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          value={option.value}
                          checked={field.value === option.value}
                          onChange={field.onChange}
                          className="accent-blue-600 w-4 h-4"
                        />
                      )}
                    />
                    <span className="text-gray-800 text-sm">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>

            {reason === "OTHER" && (
              <FormItem>
                <FormLabel htmlFor="otherReason">Enter Reason Here</FormLabel>
                <FormControl>
                  <Input
                    id="otherReason"
                    {...form.register("otherReason", {
                      required: "Please enter a reason",
                    })}
                    placeholder="Describe your reason"
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Submit
            </button>
          </form>
        </Form>
      </DialogHeader>
    </DialogContent>
  );
};
