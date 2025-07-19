"use client";

import { DialogTitle } from "@radix-ui/react-dialog";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";
import { resetApp } from "@/lib/clientUtils";

export const Reload = () => {
  return (
    <DialogContent className="bg-white">
      <DialogHeader>
        <DialogTitle>Your Session has expired.</DialogTitle>
        <DialogDescription>
          To proceed, reload the aplication and <br /> log in again to continue.
        </DialogDescription>
        <DialogFooter>
          <Button
            className="bg-[#075E54] text-white hover:bg-[#075e54d5]"
            onClick={resetApp}
          >
            <RefreshCcw /> Reload
          </Button>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
};
