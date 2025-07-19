"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useLoaderStore } from "@/store/loader";
import { Spinner } from "./ui/spinner";
import { GenericModal } from "./modal/GenericModal";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useLoaderStore((state) => state.isLoading);
  const loaderText = useLoaderStore((state) => state.loaderText);
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster richColors position="top-center" expand />
          <TooltipProvider>
            <GenericModal />
            {children}
            {isLoading && <Spinner text={loaderText} blur />}
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};
