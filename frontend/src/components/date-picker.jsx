import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function DatePicker({ events = [], onSelectDate }) {
  const [date, setDate] = React.useState(undefined)

  const handleSelect = (selectedDate) => {
    setDate(selectedDate)
    if (selectedDate && onSelectDate) {
      onSelectDate(selectedDate)
    }
  }

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  const hasEvent = (dayDate) => {
    return events.some(event => isSameDay(new Date(event.date), dayDate));
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelect}
      weekStartsOn={1}
      modifiers={{
        hasEvent: (dayDate) => hasEvent(dayDate)
      }}
      className="bg-transparent [--cell-size:2.1rem] mx-auto" />
  );
}
