"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";

interface AuthPromptModalProps {
  open: boolean;
}

export function AuthPromptModal({ open }: AuthPromptModalProps) {
  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Authentication Required
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p className="text-base">
              You are not logged in. Please sign in to access the Task Tracker
              application.
            </p>
            <p className="text-sm text-muted-foreground">
              Sign in to create, manage, and organize your tasks efficiently.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 font-medium">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full h-11 font-medium">
              Create Account
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
