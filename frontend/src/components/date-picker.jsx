import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function DatePicker() {
  const [date, setDate] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 12))
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      weekStartsOn={1}
      className="bg-transparent [--cell-size:2.1rem] mx-auto" />
  );
}
