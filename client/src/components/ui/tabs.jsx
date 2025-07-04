"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props} />
  );
}

function TabsList({
  className,
  children,
  ...props
}) {
  // State to track underline position/width
  const listRef = React.useRef(null);
  const [underline, setUnderline] = React.useState({ left: 0, width: 0 });

  // Find the active trigger and attach a ref
  const triggers = React.Children.toArray(children);
  const activeIndex = triggers.findIndex(child => child.props["data-state"] === "active");
  const activeTriggerRef = React.useRef();

  React.useEffect(() => {
    if (activeTriggerRef.current && listRef.current) {
      const { offsetLeft, offsetWidth } = activeTriggerRef.current;
      setUnderline({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeIndex, children]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "relative bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, idx) => {
        if (idx === activeIndex && React.isValidElement(child)) {
          return React.cloneElement(child, { ref: activeTriggerRef });
        }
        return child;
      })}
      <motion.div
        layout
        className="absolute bottom-0 h-1 bg-blue-600 rounded transition-all"
        style={{ left: underline.left, width: underline.width }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}, ref) {
  // Determine if this tab is active
  const isActive = props['data-state'] === 'active';
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      ref={ref}
      className={cn(
        isActive
          ? "!bg-green-500 !text-white transition-colors duration-300"
          : "transition-colors duration-300",
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}
TabsTrigger = React.forwardRef(TabsTrigger);

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
