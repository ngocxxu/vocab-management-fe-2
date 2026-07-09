'use client';

import * as React from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/libs/utils';

const Drawer = Dialog;
const DrawerTrigger = DialogTrigger;
const DrawerClose = DialogClose;

type DrawerSide = 'right' | 'bottom';

const drawerSideClasses: Record<DrawerSide, string> = {
  right: 'top-0 right-0 bottom-0 left-auto translate-x-0 translate-y-0 h-full w-3/4 max-w-md border-l rounded-l-lg rounded-r-none data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  bottom: 'top-auto right-0 bottom-0 left-0 translate-x-0 translate-y-0 max-h-[85vh] w-full border-t rounded-t-2xl rounded-b-none pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
};

const DrawerContent = ({ ref, className, children, side = 'right', ...props }: React.ComponentPropsWithoutRef<typeof DialogContent> & { ref?: React.RefObject<React.ElementRef<typeof DialogContent> | null>; side?: DrawerSide }) => (
  <DialogContent
    ref={ref}
    className={cn(
      'fixed border-border',
      'p-0',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'duration-300',
      drawerSideClasses[side],
      className,
    )}
    {...props}
  >
    <div className="flex max-h-full flex-col overflow-y-auto">
      {children}
    </div>
  </DialogContent>
);
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof DialogTitle> & { ref?: React.RefObject<React.ElementRef<typeof DialogTitle> | null> }) => (
  <DialogTitle
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
);
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof DialogDescription> & { ref?: React.RefObject<React.ElementRef<typeof DialogDescription> | null> }) => (
  <DialogDescription
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
DrawerDescription.displayName = 'DrawerDescription';

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
