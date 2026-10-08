import { CalendarClock, Phone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RegistrationClosedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseLabel?: string;
};

const RegistrationClosedDialog = ({
  open,
  onOpenChange,
  courseLabel = "Offline Masterclass",
}: RegistrationClosedDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="mx-auto mb-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-dusty-rose/20 bg-primary/[0.05]">
          <CalendarClock className="h-7 w-7 text-dusty-rose" />
        </div>
        <p className="text-center font-sans text-xs tracking-[0.32em] text-dusty-rose uppercase">
          {courseLabel}
        </p>
        <DialogTitle className="mt-1 text-center font-serif text-2xl font-light tracking-[0.02em] text-foreground">
          Registrations Are Currently Closed
        </DialogTitle>
        <DialogDescription className="mx-auto max-w-sm text-center text-[15px] leading-relaxed">
          We're not taking new sign-ups right now, but our next batch is on its way — details
          will be updated right here soon.
        </DialogDescription>
      </DialogHeader>

      <div className="my-1 h-px bg-border/20" />

      <div className="rounded-2xl border border-dusty-rose/20 bg-primary/[0.04] px-5 py-4 text-center">
        <p className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Want to be the first to know?
        </p>
        <a
          href="tel:+919818793850"
          className="mt-2 inline-flex items-center justify-center gap-2 font-serif text-lg text-foreground transition-colors duration-300 hover:text-dusty-rose"
        >
          <Phone className="h-4 w-4" />
          +91 98187 93850
        </a>
      </div>

      <Button className="mt-1 w-full" onClick={() => onOpenChange(false)}>
        Got it
      </Button>
    </DialogContent>
  </Dialog>
);

export default RegistrationClosedDialog;
