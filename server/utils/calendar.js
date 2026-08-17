export const eventToIcs = (event) => {
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const start = `${event.date.replaceAll('-', '')}T${(event.time || '00:00').replace(':', '')}00`;
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:${event.id}@campusconnect\r\nDTSTAMP:${stamp}\r\nDTSTART:${start}\r\nSUMMARY:${event.title}\r\nLOCATION:${event.location || ''}\r\nDESCRIPTION:${event.description.replace(/\n/g, '\\n')}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
};
