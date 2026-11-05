"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
        <Dialog.Content
          dir="rtl"
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] ${SIZES[size]} max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl focus:outline-none`}
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-gray-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-5 overflow-y-auto flex-1">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
