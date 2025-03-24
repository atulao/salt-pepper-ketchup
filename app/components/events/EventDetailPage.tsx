'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Check, Clock, X, User, QrCode, Share2, Heart, Download } from 'lucide-react';
import CampusMap from '../map/CampusMap';
import { getDirectionsUrl } from '../map/campus-building-data';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';
import { formatTime } from '../../utils/formatters';
import { Event } from '../../types/event';

// Event Pass Component (used inside EventDetailPage)
const EventPass = ({ event, user, qrData }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-white font-bold text-xl">Event Pass</h2>
        <p className="text-blue-100">{user.name}</p>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{event.title}</h3>
        <div className="flex items-center text-gray-600 mb-1">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{event.date} • {formatTime(event.time)}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{event.location}</span>
        </div>
        
        {/* QR Code for event check-in */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            {/* This would be a QR code component in a real implementation */}
            <div className="w-48 h-48 bg-white p-2 relative">
              <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-1">
                {/* Simplified QR code representation */}
                {Array(25).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`${
                      Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                    } ${
                      (i < 5 || i > 19 || i % 5 === 0 || i % 5 === 4) ? 'bg-black' : ''
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm">Present this pass for event check-in</p>
          <p className="text-gray-900 font-medium mt-1">{qrData || 'NJIT-SPK-' + event.id}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 flex justify-between">
        <button className="text-blue-600 font-medium text-sm flex items-center">
          <Download className="h-4 w-4 mr-1.5" />
          Save Pass
        </button>
        <button className="text-blue-600 font-medium text-sm flex items-center">
          <Share2 className="h-4 w-4 mr-1.5" />
          Share
        </button>
      </div>
    </div>
  );
};

// Main EventDetailPage Component
interface EventDetailPageProps {
  event: Event;
  currentUser: {
    id: string;
    name: string;
    email?: string;
  };
  relatedEvents?: Event[];
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ 
  event, 
  currentUser, 
  relatedEvents = [] 
}) => {
  const [rsvpStatus, setRsvpStatus] = useState<string>('none');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(true);
  const [showEventPass, setShowEventPass] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Mock attendees data (would be fetched from API)
  useEffect(() => {
    const mockAttendees = [
      { id: '1', name: 'Alex Johnson', avatar: '/avatars/user-1.jpg', status: 'going' },
      { id: '2', name: 'Taylor Smith', avatar: '/avatars/user-2.jpg', status: 'going' },
      { id: '3', name: 'Jordan Williams', avatar: '/avatars/user-3.jpg', status: 'going' },
      { id: '4', name: 'Casey Brown', avatar: '/avatars/user-4.jpg', status: 'maybe' },
      { id: '5', name: 'Riley Garcia', avatar: '/avatars/user-5.jpg', status: 'maybe' },
    ];
    
    setAttendees(mockAttendees);
  }, [event.id]);
  
  // Handle RSVP status change
  const handleRSVP = (status: string) => {
    setRsvpStatus(status);
    // In a real implementation, this would update the backend
    console.log(`RSVP updated to ${status} for event ${event.id}`);
  };
  
  // Toggle event pass visibility
  const toggleEventPass = () => {
    setShowEventPass(!showEventPass);
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Download calendar event
  const downloadToCalendar = () => {
    // Implementation similar to the one in EventCard
    console.log('Downloading calendar event');
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Event Header */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-80"
          />
        ) : null}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Event title and basic info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap items-center text-sm gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{event.date} • {formatTime(event.time)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>Hosted by {event.organizerName}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-6">
        {/* RSVP and Action buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                rsvpStatus === 'going' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
              onClick={() => handleRSVP('going')}
            >
              <Check className="h-4 w-4 inline mr-1.5" />
              Going
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                rsvpStatus === 'maybe' 
                  ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-amber-50 border border-gray-200'
              }`}
              onClick={() => handleRSVP('maybe')}
            >
              <Clock className="h-4 w-4 inline mr-1.5" />
              Maybe
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                rsvpStatus === 'not-going' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-200'
              }`}
              onClick={() => handleRSVP('not-going')}
            >
              <X className="h-4 w-4 inline mr-1.5" />
              Can't Go
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={toggleEventPass}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <QrCode className="h-4 w-4 mr-1.5" />
              My Event Pass
            </button>
            
            <button 
              onClick={toggleFavorite}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium border ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <Heart className="h-4 w-4 mr-1.5" fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            
            <button 
              onClick={downloadToCalendar}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 border border-gray-200"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Add to Calendar
            </button>
          </div>
        </div>
        
        {/* Event details and map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">About This Event</h2>
            <div className="prose prose-blue max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
            
            {/* Categories and perks */}
            <h3 className="text-lg font-medium mb-2">Categories & Perks</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm">
                <span className="capitalize">{event.category}</span>
              </span>
              
              {event.hasFood && (
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-green-700 text-sm">
                  <Coffee className="h-4 w-4 mr-1.5" />
                  {event.foodType || 'Free Food'}
                </span>
              )}
              
              {isResidenceLifeEvent(event) && (
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-sm">
                  <Home className="h-4 w-4 mr-1.5" />
                  Residence Life
                </span>
              )}
              
              {event.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Attendees */}
            <h3 className="text-lg font-medium mb-2">Who's Coming</h3>
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="flex -space-x-2 mr-3">
                  {attendees.slice(0, 5).map(attendee => (
                    <div key={attendee.id} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white relative">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {attendees.filter(a => a.status === 'going').length} going • {attendees.filter(a => a.status === 'maybe').length} maybe
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attendees.filter(a => a.status === 'going').map(attendee => (
                  <div key={attendee.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 mr-2">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-700">{attendee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            {/* Location and Map */}
            <h3 className="text-lg font-medium mb-2">Location</h3>
            {isMapVisible && (
              <div className="mb-4">
                <CampusMap 
                  location={event.location} 
                  eventTitle={event.title}
                />
              </div>
            )}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700">{event.location}</h4>
              <a 
                href={getDirectionsUrl(event.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 mt-2 text-sm"
              >
                <MapPin className="h-4 w-4 mr-1.5" />
                Get Directions
              </a>
            </div>
            
            {/* Related Events */}
            {relatedEvents && relatedEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Related Events</h3>
                <div className="space-y-3">
                  {relatedEvents.map(relEvent => (
                    <a 
                      key={relEvent.id} 
                      href={`/event/${relEvent.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <h4 className="font-medium text-gray-800">{relEvent.title}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {relEvent.date} • {formatTime(relEvent.time)}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Event Pass Modal */}
      {showEventPass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <EventPass 
              event={event} 
              user={currentUser} 
              qrData={`NJIT-EVENT-${event.id}-${currentUser.id}`}
            />
            <button 
              onClick={toggleEventPass}
              className="mt-4 w-full py-2 bg-white text-gray-700 rounded-md text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;