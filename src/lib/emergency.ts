// src/lib/emergency.ts
// Emergency numbers & contacts for the trip.
//
// The NATIONAL numbers are India's official short codes (work anywhere in the
// country, including Ladakh). LOCAL and PEOPLE are meant to be edited by you —
// confirm the exact local numbers with your accommodation on arrival.

export interface Contact {
  name: string
  number: string
  note?: string
}

/** Official India-wide emergency short codes — reliable everywhere. */
export const NATIONAL: Contact[] = [
  { name: 'All-in-one Emergency', number: '112', note: 'Police · Fire · Ambulance' },
  { name: 'Police', number: '100' },
  { name: 'Ambulance', number: '102', note: 'Also try 108' },
  { name: 'Emergency Response / Disaster', number: '108' },
  { name: 'Fire', number: '101' },
  { name: 'Women Helpline', number: '1091' },
  { name: 'Health Helpline', number: '104' },
  { name: 'Tourist Helpline (India)', number: '1363', note: '24×7, multilingual' },
]

/** Ladakh-specific — confirm the exact numbers locally; edit as needed. */
export const LOCAL: Contact[] = [
  { name: 'SNM Hospital, Leh', number: '', note: 'District hospital — ask your stay for the current direct line' },
  { name: 'Leh Tourist Police', number: '', note: 'Confirm at the Tourist Information Centre, Main Bazaar' },
  { name: 'Your accommodation', number: '', note: 'Add reception / host number on arrival' },
]

/** Your people — edit these with the real contacts before you travel. */
export const PEOPLE: Contact[] = [
  { name: 'Emergency contact (home)', number: '', note: 'Add a family member or friend' },
  { name: 'Trusted driver', number: '', note: 'Add once you have a regular driver' },
  { name: 'Travel insurance', number: '', note: 'Add your policy helpline + policy number' },
]
