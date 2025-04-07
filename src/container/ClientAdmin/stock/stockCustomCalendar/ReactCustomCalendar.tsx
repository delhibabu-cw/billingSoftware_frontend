import React, { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { GrPowerReset } from 'react-icons/gr'; // 🌀 Make sure to install react-icons

export interface StockDates {
  products: string[];
  purchase: string[];
}

interface DatePickerWithHighlightsProps {
  stockEntry: 'products' | 'purchase';
  stockDates: StockDates;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

const DatePickerWithHighlights: React.FC<DatePickerWithHighlightsProps> = ({
  stockEntry,
  stockDates,
  selectedDate: initialSelectedDate = getCurrentDate(),
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const highlightDates =
    stockEntry === 'products' ? stockDates.products : stockDates.purchase;
  const selectedDateObj = new Date(selectedDate);

  const modifiers = {
    highlight: highlightDates.map((d) => new Date(d)),
  };

  const modifiersClassNames = {
    highlight: stockEntry === 'products' ? 'bg-[#8DFF00]  rounded-full' : 'bg-[#8DFF00]  rounded-full',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      setSelectedDate(formatted);
      onDateChange?.(formatted);
      setCalendarOpen(false);
    }
  };

  const handleReset = () => {
    const today = getCurrentDate();
    setSelectedDate(today);
    onDateChange?.(today);
  };

  const today = new Date(); // Used for disabling future dates

  return (
    <div className="relative w-fit">
      {/* 📅 Selected Date + Icon + Reset */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-md border-white/30 bg-white/10">
        <span className="text-white">{format(selectedDateObj, 'dd-MM-yyyy')}</span>

        <CalendarIcon
          className="w-5 h-5 text-white cursor-pointer"
          onClick={() => setCalendarOpen(!calendarOpen)}
        />

        {selectedDate !== getCurrentDate() && (
          <button
            onClick={handleReset}
            title="Reset to today"
            className="flex items-center justify-center w-8 h-8 text-lg text-white transition border rounded-md bg-white/10 hover:bg-white hover:text-black"
          >
            <GrPowerReset />
          </button>
        )}
      </div>

      {/* 📆 Calendar Dropdown */}
      {calendarOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 p-4 mt-2 bg-white rounded-md shadow-lg 
               left-0 right-0 md:left-auto md:right-0 w-[95vw] sm:w-[22rem]"
        >
          <DayPicker
            mode="single"
            selected={selectedDateObj}
            onSelect={handleDateSelect}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            disabled={{ after: today }} // ✅ This disables tomorrow and future
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerWithHighlights;
