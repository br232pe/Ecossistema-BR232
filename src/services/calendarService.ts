import { GoogleCalendarEvent } from '../types';

export const calendarService = {
  fetchUpcomingEvents: async (accessToken: string) => {
    const now = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar eventos do calendário');
    }

    const data = await response.json();
    return data.items as any[];
  },

  filterBr232Trips: (events: any[]) => {
    const citiesBR232 = [
      'Gravatá', 'Caruaru', 'Vitória', 'Pesqueira', 'Arcoverde', 
      'Bezerros', 'Sanharó', 'Belo Jardim'
    ];

    return events.filter(event => {
      const text = `${event.summary || ''} ${event.location || ''} ${event.description || ''}`.toLowerCase();
      
      // Detecção por nome de cidade ou "BR-232"
      const hasCity = citiesBR232.some(city => text.includes(city.toLowerCase()));
      const hasRoad = text.includes('232') || text.includes('rodovia');
      
      return hasCity || hasRoad;
    }).map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      location: event.location,
      cityName: citiesBR232.find(city => 
        (event.summary || '').toLowerCase().includes(city.toLowerCase()) || 
        (event.location || '').toLowerCase().includes(city.toLowerCase())
      ) || 'Outra'
    }));
  }
};
