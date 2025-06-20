import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface TimeSlot {
  time: string;
  staff_member: string;
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
    setSuccess(false);
    
    // Clear meeting details when date changes
    setMeetingDetails('', '', '', '');
  };

  // Handle time selection and IMMEDIATELY save to form store
  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    
    setSelectedTime(time);
    
    // Find the selected time slot to get the staff member
    const selectedSlot = availableSlots.find(slot => slot.time === time);
    const staffMember = selectedSlot?.staff_member || 'dom'; // Fallback to 'dom' if not found
    
    // Calculate end time (15 minutes after start time)
    const calculateEndTime = (startTime: string): string => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      date.setMinutes(date.getMinutes() + 15);
      return date.toTimeString().slice(0, 5);
    };
    
    const endTime = calculateEndTime(time);
    
    // DIRECTLY save to form store with the correct staff member from availability data
    setMeetingDetails(staffMember, selectedDate, time, endTime);
    
    setSuccess(true);
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
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`text-xs ${
                      selectedTime === slot.time 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500' 
                        : 'border-yellow-300 text-black hover:bg-yellow-50'
                    }`}
                    title={`${slot.time} with ${slot.staff_member.charAt(0).toUpperCase() + slot.staff_member.slice(1)}`}
                  >
                    {slot.time}
                    <br />
                    <span className="text-xs opacity-75">
                      {slot.staff_member.charAt(0).toUpperCase() + slot.staff_member.slice(1)}
                    </span>
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

        {/* Selection Summary - Shows what's selected, will be saved when form is submitted */}
        {selectedDate && selectedTime && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Selected:</strong> {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })} at {selectedTime}
              {(() => {
                const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
                return selectedSlot ? ` with ${selectedSlot.staff_member.charAt(0).toUpperCase() + selectedSlot.staff_member.slice(1)}` : '';
              })()}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Duration: 15 minutes • This will be saved when you submit the lead
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default AgentCalendarWidget; 