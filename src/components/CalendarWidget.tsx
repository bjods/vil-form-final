import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface TimeSlot {
  time: string;
  staff_member?: string;
}

interface CalendarWidgetProps {
  onMeetingBooked?: (date: string, time: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onMeetingBooked }) => {
  const { state, setMeetingDetails } = useFormStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
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
      
      console.log(`Fetching availability for ${bookableDates.length} dates in batch`);
      
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
      
      console.log(`Loaded availability for ${Object.keys(data.dates || {}).length} dates (${data.cached_count || 0} cached, ${data.fresh_count || 0} fresh)`);
      
    } catch (err) {
      console.error('Error fetching month availability:', err);
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
    
    // No need to fetch - data is already cached in monthAvailability
  };

  // Handle time selection
  const handleTimeSelect = (time: string, staffMember?: string) => {
    setSelectedTime(time);
    // Store the staff member for this time slot (for use in booking)
    if (staffMember) {
      // We'll use this when booking to ensure we save the correct provider
      setSelectedTime(`${time}|${staffMember}`);
    }
  };

  // Book the meeting
  const handleBookMeeting = async () => {
    if (!selectedDate || !selectedTime || !state.sessionId) {
      setError('Please select a date and time');
      return;
    }

    setBooking(true);
    setError(null);

    try {
      // Extract time and staff member from selectedTime
      const [time, staffMember] = selectedTime.includes('|') 
        ? selectedTime.split('|') 
        : [selectedTime, undefined];

      const response = await fetch(getApiUrl('book-meeting'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_id: state.sessionId,
          date: selectedDate,
          time: time,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book meeting');
      }

      const data = await response.json();
      
      // Extract the actual time (without staff member) for display
      const displayTime = selectedTime.includes('|') ? selectedTime.split('|')[0] : selectedTime;
      
      // The response structure is flat, not nested under 'meeting'
      // Update local state with the meeting details from the response
      if (data.success && data.data_sent?.meeting_details) {
        setMeetingDetails(
          data.data_sent.meeting_details.provider || staffMember || 'dom',
          data.data_sent.meeting_details.date || selectedDate,
          data.data_sent.meeting_details.start_time || displayTime,
          data.data_sent.meeting_details.end_time || ''
        );
      } else {
        // Fallback if the response structure is different
        setMeetingDetails(
          staffMember || 'dom', // Use the staff member from the selected slot
          selectedDate,
          displayTime,
          '' // End time will be calculated
        );
      }

      setSuccess(true);
      
      // Call the callback if provided
      if (onMeetingBooked) {
        onMeetingBooked(selectedDate, selectedTime);
      }

      // Reset selections and refresh availability
      setSelectedDate(null);
      setSelectedTime(null);
      
      // Refresh the month availability to reflect the new booking
      setTimeout(() => {
        fetchMonthAvailability();
      }, 1000);

    } catch (err) {
      console.error('Error booking meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to book meeting');
    } finally {
      setBooking(false);
    }
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
    // Clear cached data when changing months
    setMonthAvailability({});
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch availability for the current month when it changes
  useEffect(() => {
    fetchMonthAvailability();
  }, [currentDate]);

  // Get available slots for selected date from cached data
  const availableSlots = selectedDate ? (monthAvailability[selectedDate] || []) : [];

  // If meeting is already scheduled, show confirmation
  if (state.meetingScheduled || success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="h-6 w-6" />
            <CardTitle>Meeting Scheduled!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Your discovery call has been scheduled for:
            </p>
            <p className="font-semibold text-black mt-1">
              {state.meetingDate && new Date(state.meetingDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="font-semibold text-black">
              {state.meetingStartTime} - {state.meetingEndTime}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            You'll receive a confirmation email with meeting details shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Your Discovery Call
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select a date and time for your 15-minute discovery call
        </p>
        {monthLoading && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
            Loading calendar availability...
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isBookable = isDateBookable(day);
            const dateString = day.toISOString().split('T')[0];
            const isSelected = selectedDate === dateString;
            const hasAvailability = monthAvailability[dateString]?.length > 0;
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                disabled={!isBookable || !isCurrentMonth || monthLoading}
                className={`
                  p-2 text-sm rounded-lg transition-colors relative
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isToday && !isSelected ? 'bg-yellow-600 text-white font-semibold' : ''}
                  ${isSelected ? 'bg-black text-white font-semibold' : ''}
                  ${hasAvailability && isCurrentMonth && !isSelected && !isToday ? 'bg-yellow-200 text-black hover:bg-yellow-300' : ''}
                  ${isBookable && isCurrentMonth && !isSelected && !hasAvailability && !isToday ? 'hover:bg-gray-100' : ''}
                  ${!isBookable || !isCurrentMonth || monthLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${monthLoading ? 'opacity-50' : ''}
                `}
              >
                {day.getDate()}
                {hasAvailability && isCurrentMonth && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h4 className="font-medium">
                Available times for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
            </div>
            
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time || selectedTime === `${slot.time}|${slot.staff_member}` ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(slot.time, slot.staff_member)}
                    className={`text-xs ${
                      selectedTime === slot.time || selectedTime === `${slot.time}|${slot.staff_member}`
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500' 
                        : 'border-yellow-300 text-black hover:bg-yellow-50'
                    }`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No available times for this date</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Book Meeting Button */}
        {selectedDate && selectedTime && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Selected:</strong> {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })} at {selectedTime.includes('|') ? selectedTime.split('|')[0] : selectedTime}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Duration: 15 minutes
              </p>
            </div>
            
            <Button
              onClick={handleBookMeeting}
              disabled={booking}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
              size="lg"
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Booking Meeting...
                </>
              ) : (
                'Book Discovery Call'
              )}
            </Button>
          </div>
        )}


      </CardContent>
    </Card>
  );
};

export default CalendarWidget; 