"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker";

// Local lightweight DateRange type to avoid importing from react-day-picker types
type DateRange = {
  from?: Date;
  to?: Date;
};

interface DateRangePickerProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
}

export default function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  // Use the provided value and onChange props, or fall back to internal state
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Update internal state when props change (handling clear / parent state updates)
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  // Handle window resize to adjust calendar months for mobile screens
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle date changes
  const handleDateChange = (newDate: ReactDayPickerDateRange | undefined) => {
    const convertedDate = newDate
      ? {
          from: newDate.from,
          to: newDate.to,
        }
      : undefined;

    setDate(convertedDate);
    if (onChange) {
      onChange(convertedDate);
    }

    // Auto-close popover when both start and end dates are selected and they are different
    if (
      newDate?.from &&
      newDate?.to &&
      newDate.from.getTime() !== newDate.to.getTime()
    ) {
      setOpen(false);
    }
  };

  // Convert local DateRange to react-day-picker DateRange for the Calendar component
  const calendarDate: ReactDayPickerDateRange | undefined =
    date && date.from
      ? {
          from: date.from,
          to: date.to,
        }
      : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id="date"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full md:w-[240px] justify-start text-left font-normal h-10",
            (!date || (!date.from && !date.to)) && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd, yyyy")} -{" "}
                {format(date.to, "MMM dd, yyyy")}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={calendarDate}
            onSelect={handleDateChange}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
