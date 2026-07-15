import type { VariantProps } from 'class-variance-authority';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/libs/utils';

const tabsListVariants = cva('inline-flex w-fit items-center', {
  variants: {
    variant: {
      pill: 'bg-accent text-muted-foreground min-h-11 justify-center gap-1 rounded-2xl p-1',
      underline: 'gap-6 justify-start border-b border-border p-0',
    },
  },
  defaultVariants: { variant: 'pill' },
});

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center gap-1.5 text-sm font-semibold whitespace-nowrap transition-[color,background-color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-ring focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
  {
    variants: {
      variant: {
        pill: 'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground data-[state=inactive]:hover:text-foreground rounded-xl border border-transparent px-4 py-2',
        underline: 'data-[state=active]:text-primary data-[state=active]:border-primary text-muted-foreground data-[state=inactive]:hover:text-foreground -mb-px rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-1 pb-3',
      },
    },
    defaultVariants: { variant: 'pill' },
  },
);

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
