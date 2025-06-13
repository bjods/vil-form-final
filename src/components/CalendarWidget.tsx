import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface TimeSlot {
  time: string;
}

interface CalendarWidgetProps {
  onMeetingBooked?: (date: string, time: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onMeetingBooked }) => {
  const { state, setMeetingDetails } = useFormStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [datesWithAvailability, setDatesWithAvailability] = useState<Set<string>>(new Set());

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

  // Fetch available slots for a specific date
  const fetchAvailableSlots = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiUrl('check-availability')}?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      setAvailableSlots(data.available_slots || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load available times');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch availability for multiple dates to show visual cues
  const fetchMonthAvailability = async (dates: Date[]) => {
    const availableDates = new Set<string>();
    
    // Only check bookable dates
    const bookableDates = dates.filter(isDateBookable);
    
    try {
      // Check availability for each bookable date
      const promises = bookableDates.map(async (date) => {
        const dateString = date.toISOString().split('T')[0];
        try {
          const response = await fetch(`${getApiUrl('check-availability')}?date=${dateString}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.available_slots && data.available_slots.length > 0) {
              availableDates.add(dateString);
            }
          }
        } catch (err) {
          console.error(`Error checking availability for ${dateString}:`, err);
        }
      });
      
      await Promise.all(promises);
      setDatesWithAvailability(availableDates);
    } catch (err) {
      console.error('Error fetching month availability:', err);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isDateBookable(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTime(null);
    fetchAvailableSlots(dateString);
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
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
      const response = await fetch(getApiUrl('book-meeting'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_id: state.sessionId,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book meeting');
      }

      const data = await response.json();
      
      // Update local state
      setMeetingDetails(
        data.meeting.staff_member,
        data.meeting.date,
        data.meeting.start_time,
        data.meeting.end_time
      );

      setSuccess(true);
      
      // Call the callback if provided
      if (onMeetingBooked) {
        onMeetingBooked(selectedDate, selectedTime);
      }

      // Reset selections
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableSlots([]);

    } catch (err) {
      console.error('Error booking meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to book meeting');
    } finally {
      setBooking(false);
    }
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

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch availability for the current month when it changes
  useEffect(() => {
    fetchMonthAvailability(calendarDays);
  }, [currentDate]);

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
              {state.meetingDate && new Date(state.meetingDate).toLocaleDateString('en-US', {
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
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
            const hasAvailability = datesWithAvailability.has(dateString);
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                disabled={!isBookable || !isCurrentMonth}
                className={`
                  p-2 text-sm rounded-lg transition-colors relative
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isToday && !isSelected ? 'bg-yellow-600 text-white font-semibold' : ''}
                  ${isSelected ? 'bg-black text-white font-semibold' : ''}
                  ${hasAvailability && isCurrentMonth && !isSelected && !isToday ? 'bg-yellow-200 text-black hover:bg-yellow-300' : ''}
                  ${isBookable && isCurrentMonth && !isSelected && !hasAvailability && !isToday ? 'hover:bg-gray-100' : ''}
                  ${!isBookable || !isCurrentMonth ? 'cursor-not-allowed' : 'cursor-pointer'}
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
                Available times for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading available times...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`text-xs ${
                      selectedTime === slot.time 
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
                <strong>Selected:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })} at {selectedTime}
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

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Meetings must be booked at least 24 hours in advance</p>
          <p>• Available booking window: up to 2 weeks in advance</p>
          <p>• All meetings are 15 minutes long</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget; 