"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Renamed dialog primitives specifically for the Edit Profile popup to avoid cross-branch name conflicts
const PopupEditProfile = DialogPrimitive.Root;
const PopupEditProfileTrigger = DialogPrimitive.Trigger;
const PopupEditProfileClose = DialogPrimitive.Close;
const PopupEditProfilePortal = DialogPrimitive.Portal;

const PopupEditProfileOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
PopupEditProfileOverlay.displayName = DialogPrimitive.Overlay.displayName;

const PopupEditProfileContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <PopupEditProfilePortal>
    <PopupEditProfileOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </PopupEditProfilePortal>
));
PopupEditProfileContent.displayName = DialogPrimitive.Content.displayName;

function PopupEditProfileHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

function PopupEditProfileFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-end gap-2", className)} {...props} />;
}

function PopupEditProfileTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function PopupEditProfileDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export {
  PopupEditProfile,
  PopupEditProfileTrigger,
  PopupEditProfileClose,
  PopupEditProfileContent,
  PopupEditProfileHeader,
  PopupEditProfileFooter,
  PopupEditProfileTitle,
  PopupEditProfileDescription,
};
