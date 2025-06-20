import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface TimeSlot {
  time: string;
  staff_member?: string;
}

interface AgentCalendarWidgetProps {
  // No props needed - uses form store directly
}

export const AgentCalendarWidget: React.FC<AgentCalendarWidgetProps> = () => {
  const { state, setMeetingDetails } = useFormStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Cache availability data for the entire month
  const [monthAvailability, setMonthAvailability] = useState<{ [date: string]: TimeSlot[] }>({});
  const [monthLoading, setMonthLoading] = useState(false);

  // Get the project URL for API calls
  const getApiUrl = (endpoint: string) => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${baseUrl}/functions/v1/${endpoint}`;
  };

  // Check if a date is within the booking window (24 hours to 2 weeks)
  const isDateBookable = (date: Date): boolean => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    twoWeeksFromNow.setHours(23, 59, 59, 999);
    
    return date >= tomorrow && date <= twoWeeksFromNow;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  // Fetch availability for the entire month using batch API
  const fetchMonthAvailability = async () => {
    setMonthLoading(true);
    setError(null);
    
    try {
      const calendarDays = generateCalendarDays();
      
      // Only check bookable dates
      const bookableDates = calendarDays
        .filter(isDateBookable)
        .map(date => date.toISOString().split('T')[0]);
      
      if (bookableDates.length === 0) {
        setMonthAvailability({});
        return;
      }
      
      console.log(`🗓️ Agent Calendar: Fetching availability for ${bookableDates.length} dates in batch`);
      
      // Use batch API to fetch all dates at once
      const response = await fetch(`${getApiUrl('check-availability')}?dates=${bookableDates.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch month availability');
      }
      
      const data = await response.json();
      
      // Update state with all availability data
      setMonthAvailability(data.dates || {});
      
      console.log(`🗓️ Agent Calendar: Loaded availability for ${Object.keys(data.dates || {}).length} dates`);
      
    } catch (err) {
      console.error('❌ Agent Calendar: Error fetching month availability:', err);
      setError('Failed to load calendar availability');
      setMonthAvailability({});
    } finally {
      setMonthLoading(false);
    }
  };

  // Handle date selection (now instant since data is cached)
  const handleDateSelect = (date: Date) => {
    if (!isDateBookable(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTime(null);
    setSuccess(false);
    
    console.log(`🗓️ Agent Calendar: Date selected: ${dateString}`);
    
    // Clear meeting details when date changes
    setMeetingDetails('', '', '', '');
  };

  // Handle time selection and IMMEDIATELY save to form store
  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    
    setSelectedTime(time);
    
    // Find the staff member for this time slot
    const timeSlot = availableSlots.find(slot => slot.time === time);
    const staffMember = timeSlot?.staff_member || 'dom'; // Default to 'dom'
    
    // Calculate end time (15 minutes after start time)
    const calculateEndTime = (startTime: string): string => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      date.setMinutes(date.getMinutes() + 15);
      return date.toTimeString().slice(0, 5);
    };
    
    const endTime = calculateEndTime(time);
    
    console.log(`🗓️ Agent Calendar: Time selected: ${time}, Staff: ${staffMember}, End: ${endTime}`);
    console.log(`🗓️ Agent Calendar: Saving meeting details to form store...`);
    
    // DIRECTLY save to form store like the working CalendarWidget does
    setMeetingDetails(staffMember, selectedDate, time, endTime);
    
    setSuccess(true);
    
    console.log(`✅ Agent Calendar: Meeting details saved successfully!`);
    console.log(`📅 Meeting scheduled: ${selectedDate} at ${time} with ${staffMember}`);
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
    setSelectedDate(null);
    setSelectedTime(null);
    setSuccess(false);
    // Clear cached data when changing months
    setMonthAvailability({});
    
    // Clear meeting details when navigating
    setMeetingDetails('', '', '', '');
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch availability for the current month when it changes
  useEffect(() => {
    fetchMonthAvailability();
  }, [currentDate]);

  // Get available slots for selected date from cached data
  const availableSlots = selectedDate ? (monthAvailability[selectedDate] || []) : [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Discovery Call (Optional)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select a date and time for a 15-minute discovery call. This will be saved when you submit the lead.
        </p>
        {monthLoading && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
            Loading calendar availability...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={monthLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{monthYear}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={monthLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isBookable = isDateBookable(date);
              const isSelected = selectedDate === dateString;
              const hasAvailability = monthAvailability[dateString]?.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isBookable || !hasAvailability || monthLoading}
                  className={`
                    p-2 text-sm border rounded transition-colors
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : ''}
                    ${isBookable && hasAvailability && !isSelected ? 'hover:bg-gray-100 border-gray-200' : ''}
                    ${!isBookable || !hasAvailability ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h4 className="font-medium">
                Available Times for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
            </div>
            
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(slot.time)}
                    className={selectedTime === slot.time ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No available times for this date</p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && selectedDate && selectedTime && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Meeting Time Selected</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })} at {selectedTime}
            </p>
            <p className="text-xs text-green-600 mt-1">
              This meeting will be saved when you submit the lead.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentCalendarWidget; 