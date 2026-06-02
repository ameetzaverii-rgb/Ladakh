import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// One-time seed endpoint — call GET /api/seed from browser after deploy
// Protected by a simple token to prevent public abuse
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (token !== 'ladakh2026') {
    return NextResponse.json({ error: 'Unauthorized. Add ?token=ladakh2026' }, { status: 401 })
  }

  try {
    // Trip Config
    await db.tripConfig.upsert({
      where: { id: 'trip-config-1' },
      update: {
        categoryBudgets: {
          ACCOMMODATION: 76500, FOOD: 31500, TRANSPORT: 15000, TREK: 21500,
          PERMITS: 1500, SHOPPING: 10000, HEALTH: 3000, WORK: 0, MISC: 5000,
        },
      },
      create: {
        id: 'trip-config-1',
        tripStartDate: new Date('2026-07-22'),
        tripEndDate: new Date('2026-08-11'),
        totalBudgetINR: 150000,
        homeCity: 'Delhi',
        travelerName: 'Amit',
        categoryBudgets: {
          ACCOMMODATION: 76500, FOOD: 31500, TRANSPORT: 15000, TREK: 21500,
          PERMITS: 1500, SHOPPING: 10000, HEALTH: 3000, WORK: 0, MISC: 5000,
        },
      },
    })

    // Flights
    await db.flight.deleteMany()
    await db.flight.createMany({ data: [
      { origin: 'DEL', destination: 'IXL', airline: 'IndiGo', flightNumber: '6E 2041', departureTime: '07:00', durationMins: 75, priceINR: 7200, available: true, bookingUrl: 'https://www.goindigo.in/', notes: 'Earliest morning flight, best views on approach' },
      { origin: 'DEL', destination: 'IXL', airline: 'Air India', flightNumber: 'AI 444', departureTime: '07:30', durationMins: 80, priceINR: 8500, available: true, bookingUrl: 'https://www.airindia.in/', notes: 'Reliable, good baggage allowance' },
      { origin: 'DEL', destination: 'IXL', airline: 'SpiceJet', flightNumber: 'SG 122', departureTime: '09:00', durationMins: 80, priceINR: 6800, available: true, notes: 'Budget option — book early' },
      { origin: 'DEL', destination: 'IXL', airline: 'IndiGo', flightNumber: '6E 2043', departureTime: '14:00', durationMins: 75, priceINR: 9500, available: true, notes: 'Afternoon option' },
      { origin: 'IXL', destination: 'DEL', airline: 'IndiGo', flightNumber: '6E 2042', departureTime: '10:00', durationMins: 75, priceINR: 7000, available: true, notes: 'Return flight option' },
      { origin: 'IXL', destination: 'DEL', airline: 'Air India', flightNumber: 'AI 445', departureTime: '11:00', durationMins: 80, priceINR: 8200, available: true, notes: 'Mid-morning return' },
    ]})

    // Stays
    await db.stay.deleteMany()
    await db.stay.createMany({ data: [
      { name: 'The Grand Dragon Ladakh', type: 'HOTEL', neighbourhood: 'Fort Road', pricePerNightINR: 8500, priceMonthlyINR: 160000, wifiRating: 5, hasCoworking: true, hasPowerBackup: true, viewType: 'Stok Kangri range', breakfastIncl: true, available: true, bookingUrl: 'https://www.thegranddragonladakh.com/', description: "Leh's best-known upscale property. Consistent fiber internet, panoramic mountain views, reliable power backup.", highlights: ['Great WiFi', 'Mountain View', 'Coworking Space', 'Breakfast Included'] },
      { name: 'The Bodhi Tree Ladakh', type: 'HOTEL', neighbourhood: 'Changspa', pricePerNightINR: 6000, priceMonthlyINR: 120000, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, viewType: 'Zanskar and Stok views', breakfastIncl: true, available: true, description: 'Boutique property with gorgeous garden, Zanskar and Stok views, excellent breakfast included.', highlights: ['Mountain View', 'Garden', 'Breakfast Included', 'Boutique'] },
      { name: 'Hotel Ladakh Retreat', type: 'HOTEL', neighbourhood: 'Changspa Road', pricePerNightINR: 4000, priceMonthlyINR: 67500, wifiRating: 4, hasCoworking: true, hasPowerBackup: true, viewType: 'Mountain and garden', breakfastIncl: false, available: true, description: 'Coworking spaces on-site, lush garden, reliable WiFi, balconies with mountain view.', highlights: ['Coworking', 'Business Centre', 'Garden Views'] },
      { name: 'Woosah Hostel', type: 'HOSTEL', neighbourhood: 'Central Leh', pricePerNightINR: 2000, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, breakfastIncl: false, available: true, description: "One of Leh's top-rated workation hostels. Fast WiFi, power backup, great common areas.", highlights: ['Community', 'Fast WiFi', 'Digital Nomad Friendly'] },
      { name: 'Dejavu Hostel Leh', type: 'HOSTEL', neighbourhood: 'Old Town', pricePerNightINR: 1500, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, viewType: 'Leh Palace views from rooftop', breakfastIncl: false, available: true, description: 'Solid WiFi, clean rooms, rooftop with Leh Palace views.', highlights: ['Rooftop Views', 'Laundry', 'Leh Palace View'] },
      { name: 'Skitpo Guest House', type: 'GUESTHOUSE', neighbourhood: 'Changspa', pricePerNightINR: 2750, wifiRating: 3, hasCoworking: false, hasPowerBackup: true, viewType: 'Panoramic mountain views', breakfastIncl: false, available: true, description: 'Near Shanti Stupa, 15-min walk to Main Market. Panoramic mountain views.', highlights: ['Palace Views', 'WiFi', 'Mountain Panorama'] },
    ]})

    // Treks
    await db.trek.deleteMany()
    await db.trek.createMany({ data: [
      { name: 'Sham Valley Trek (Village Circuit)', difficulty: 'EASY', durationDays: 2, maxAltitudeM: 4100, distanceKm: 25, startPoint: 'Leh', permitRequired: false, priceINR: 3500, company: 'Ju-Leh Adventure', companyUrl: 'https://ju-lehadventure.com', available: true, season: 'June–September', description: 'The gentlest introduction to Ladakhi trekking. Ancient villages, apricot orchards, monasteries on cliffs.', highlights: ['Ribbok monastery', 'Yak meadows', 'Village homestay', 'Traditional architecture'] },
      { name: 'Stok Kangri Base Camp Day Trek', difficulty: 'MEDIUM', durationDays: 1, maxAltitudeM: 4800, distanceKm: 12, startPoint: 'Stok Village (15km from Leh)', permitRequired: false, priceINR: 2000, company: 'Overland Escape', companyUrl: 'https://overlandescape.com', available: true, season: 'June–September', description: 'Most popular day hike from Leh. Stok Valley past glacial streams to Stok Kangri base camp.', highlights: ['360° Karakoram views', 'Glacial streams', 'High-altitude meadows'] },
      { name: 'Markha Valley Trek (2-Day Section)', difficulty: 'HARD', durationDays: 2, maxAltitudeM: 5150, distanceKm: 30, startPoint: 'Skiu (40km from Leh by 4WD)', permitRequired: false, priceINR: 7500, company: 'Ancient Tracks', companyUrl: 'https://ancienttracks.com', available: true, season: 'June–September', description: "Ladakh's most famous multi-day trek. Cross the Markha River multiple times, remote villages.", highlights: ['Kang Yatse peak views', 'Markha village gompa', 'Yak herders', 'Incredible solitude'] },
      { name: 'Pangong Lake Shore Walk', difficulty: 'EASY', durationDays: 1, maxAltitudeM: 4350, distanceKm: 8, startPoint: 'Pangong Tso lakeside camp', permitRequired: true, priceINR: 0, available: true, season: 'June–September', description: 'Gentle walk along the north shore past Spangmik and Merak villages.', highlights: ['Colour-shifting lake', 'Spangmik village', 'Sunrise at water edge', 'Total silence'] },
      { name: 'Zanskar River Rafting', difficulty: 'MEDIUM', durationDays: 1, maxAltitudeM: 3000, distanceKm: 15, startPoint: 'Nimmu (45km from Leh)', permitRequired: false, priceINR: 2000, company: 'Explore Himalayas', available: true, season: 'July–September', description: 'Grade III–IV white water rafting on the Zanskar River near Nimmu.', highlights: ['Grade III-IV rapids', 'Canyon walls', 'Zanskar gorge'] },
    ]})

    // Events
    await db.event.deleteMany()
    await db.event.createMany({ data: [
      { name: 'Phyang Tsedup Festival', type: 'FESTIVAL', location: 'Phyang Monastery, 17km from Leh', startDate: new Date('2026-07-22'), endDate: new Date('2026-07-23'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 17, description: "One of Ladakh's most visually spectacular festivals. Sacred Cham masked dances, dramatic unfurling of the giant Thangka silk scroll.", tips: 'Arrive early morning (7am) before crowds. Taxi ₹800–1,200 return.' },
      { name: 'Korzok Gustor (Tso Moriri)', type: 'FESTIVAL', location: 'Korzok Monastery, Tso Moriri', startDate: new Date('2026-07-27'), endDate: new Date('2026-07-28'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 220, description: 'Annual monastery festival at remote Tso Moriri lake at 4,522m altitude.', tips: 'Permit required. 5–6 hour drive from Leh.' },
      { name: 'Thiksey Monastery Morning Puja', type: 'MONASTERY', location: 'Thiksey Monastery, 19km from Leh', startDate: new Date('2026-07-25'), endDate: new Date('2026-07-25'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 19, description: 'Early morning prayer ceremony at Thiksey — chanting, drums, butter-lamps at 6am.', tips: 'Arrive by 6am sharp. Donation-based.' },
      { name: 'Main Market Evening Bazaar', type: 'MARKET', location: 'Main Bazaar, Central Leh', startDate: new Date('2026-07-26'), endDate: new Date('2026-07-26'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 0, description: 'Main Market alive in the evening with stalls selling local crafts, pashmina, thangka paintings, dried apricots.', tips: 'Evening 6–9pm peak time. Cash only.' },
      { name: 'Shanti Stupa Stargazing', type: 'ASTRONOMY', location: 'Shanti Stupa, Leh', startDate: new Date('2026-07-30'), endDate: new Date('2026-07-30'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 1, description: "Some of India's darkest skies. The Milky Way is a solid river of light at 3,600m.", tips: 'Bring a warm jacket (8°C at night). Best around new moon.' },
      { name: 'Ladakh Festival (if you extend)', type: 'FESTIVAL', location: 'Leh, Polo Grounds', startDate: new Date('2026-09-21'), endDate: new Date('2026-09-24'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 0, description: "Ladakh's biggest festival. Archery, polo, traditional music, folk dances, monastery performances.", tips: 'Book accommodation 3–4 months ahead.' },
    ]})

    // Transport
    await db.transport.deleteMany()
    await db.transport.createMany({ data: [
      { type: 'TAXI', destination: 'Leh ↔ Thiksey + Hemis circuit', distanceKm: 50, rateINR: 2000, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 4 },
      { type: 'TAXI', destination: 'Leh ↔ Phyang Monastery', distanceKm: 17, rateINR: 1000, rateType: 'return', permitRequired: false, permitTypes: [], durationHours: 1 },
      { type: 'TAXI', destination: 'Leh ↔ Shanti Stupa', distanceKm: 4, rateINR: 400, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.25 },
      { type: 'TAXI', destination: 'Leh ↔ Sangam Confluence', distanceKm: 35, rateINR: 2200, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 3 },
      { type: 'TAXI', destination: 'Leh ↔ Alchi Monastery', distanceKm: 70, rateINR: 3400, rateType: 'full-day', permitRequired: false, permitTypes: [], durationHours: 6 },
      { type: 'TAXI', destination: 'Leh ↔ Pangong Tso (one way)', distanceKm: 160, rateINR: 5750, rateType: 'one-way', permitRequired: true, permitTypes: ['ILP', 'RAP'], permitCostINR: 400, durationHours: 3.5 },
      { type: 'TAXI', destination: 'Leh ↔ Nubra Valley 2-day', distanceKm: 120, rateINR: 7000, rateType: '2-day', permitRequired: true, permitTypes: ['ILP'], permitCostINR: 400, durationHours: 5 },
      { type: 'TAXI', destination: 'Leh ↔ Stok village', distanceKm: 15, rateINR: 750, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.5 },
      { type: 'TAXI', destination: 'Leh ↔ Lamayuru', distanceKm: 125, rateINR: 4200, rateType: 'full-day', permitRequired: false, permitTypes: [], durationHours: 7 },
      { type: 'TAXI', destination: 'Leh ↔ Magnetic Hill + circuit', distanceKm: 30, rateINR: 2300, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 3 },
      { type: 'TAXI', destination: 'Airport Transfer', distanceKm: 5, rateINR: 500, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.25 },
      { type: 'BIKE_RENTAL', destination: 'Leh & surrounds (per day)', distanceKm: 0, rateINR: 1600, rateType: 'per-day', permitRequired: false, permitTypes: [] },
    ]})

    // Places
    await db.place.deleteMany()
    await db.place.createMany({ data: [
      { name: 'Lehvenda Café', type: 'CAFE', neighbourhood: 'Changspa', description: "Consistently Leh's best café. Exceptional specialty coffee, extraordinary tea selection, mountain views from terrace.", mustOrder: ['Specialty pour-over', 'Himalayan tea', 'Apricot pastry'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 400, openNow: true, seasonal: true, tags: ['Best Overall', 'Work-Friendly', 'Mountain Views'] },
      { name: 'Open Sky Café', type: 'CAFE', neighbourhood: 'Fort Road', description: 'Legendary rooftop with the best panoramic view of Leh. Coffee, cakes, and Western meals.', mustOrder: ['Apricot cake', 'Cold brew', 'Eggs benedict'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 500, openNow: true, seasonal: true, tags: ['Best Rooftop', 'Spectacular Views'] },
      { name: 'Coffee Culture Leh', type: 'CAFE', neighbourhood: 'Central Leh', description: 'The coworking café for remote workers in Leh. Modern, fast WiFi, good espresso.', mustOrder: ['Americano', 'BLT sandwich', 'Sea buckthorn smoothie'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 350, openNow: true, seasonal: true, tags: ['Coworking Hub', 'Fast WiFi', 'Power Outlets'] },
      { name: 'Namza Café', type: 'CAFE', neighbourhood: 'Changspa', description: 'Charming, quiet, local ingredients. Healthy bowls, salads, fresh juices.', mustOrder: ['Khambir sandwich', 'Sea buckthorn juice', 'Local salad'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 300, openNow: true, seasonal: true, tags: ['Local Ingredients', 'Quiet', 'Healthy'] },
      { name: 'Leh Town Café', type: 'CAFE', neighbourhood: 'Fort Road', description: 'Brilliant ambiance, books and guitar to borrow, modern interiors. Famous for iris and hazelnut coffees.', mustOrder: ['Iris cappuccino', 'Paneer sandwich', 'Hazelnut latte'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 380, openNow: true, seasonal: true, tags: ['Best Coffee', 'Books & Music'] },
      { name: "Bob's Café", type: 'CAFE', neighbourhood: 'Central Leh', description: 'Cozy institution beloved by trekkers. Perfect post-trek recovery spot.', mustOrder: ['Full breakfast', 'Mint lemon tea', 'French toast'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 350, openNow: true, seasonal: true, tags: ['Trekker Favourite', 'Cozy'] },
      { name: 'The Tibetan Kitchen', type: 'RESTAURANT', neighbourhood: 'Fort Road', description: 'Best momos in Leh, full stop. Authentic Tibetan-Ladakhi menu, excellent thukpa.', mustOrder: ['Yak meat momo', 'Skyu', 'Thukpa', 'Butter tea'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 450, openNow: true, seasonal: true, tags: ['Best Momos', 'Authentic Ladakhi'] },
      { name: 'Bon Appetit', type: 'RESTAURANT', neighbourhood: 'Changspa', description: 'Popular with long-stay travellers. Multi-cuisine menu, reasonable prices, consistent quality.', mustOrder: ['Full English breakfast', 'Pasta', 'Lasagne'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 550, openNow: true, seasonal: true, tags: ['Multi-Cuisine', 'Long Stay Favourite'] },
      { name: 'Neha Snacks (Main Bazaar)', type: 'STREET_FOOD', neighbourhood: 'Main Bazaar', description: 'Local favourite for quick bites — momos, thukpa, samosas, pakoras.', mustOrder: ['Steamed momos', 'Samosa', 'Aloo tikki'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 150, openNow: true, seasonal: true, tags: ['Street Food', 'Budget'] },
      { name: 'Chopsticks', type: 'RESTAURANT', neighbourhood: 'Main Market', description: "Leh's best Chinese-Tibetan restaurant. Noodles, dumplings, fried rice done properly.", mustOrder: ['Wonton soup', 'Fried rice', 'Spring rolls'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 600, openNow: true, seasonal: true, tags: ['Chinese-Tibetan', 'Comfort Food'] },
      { name: 'Little Italy', type: 'RESTAURANT', neighbourhood: 'Main Market', description: 'Surprisingly excellent Italian at altitude. Great pizzas, pasta, salads.', mustOrder: ['Margherita pizza', 'Penne arrabbiata', 'Tiramisu'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 700, openNow: true, seasonal: true, tags: ['Italian', 'Good Break'] },
      { name: "Wanderer's Terrace", type: 'RESTAURANT', neighbourhood: 'Fort Road', description: 'Rooftop restaurant, sweeping Leh views, good multi-cuisine menu.', mustOrder: ['Dal makhani', 'Paneer tikka', 'Cold beer'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 750, openNow: true, seasonal: true, tags: ['Rooftop', 'Sunset Views'] },
    ]})

    // Checklist
    await db.checklistItem.deleteMany()
    await db.checklistItem.createMany({ data: [
      { title: 'Book Delhi–Leh flight (return, July 22 dep)', category: 'FLIGHTS', phase: 'ASAP', priority: 1, notes: 'Book 6–8 weeks ahead. Morning flights for best views.' },
      { title: 'Book accommodation for 21 nights', category: 'ACCOMMODATION', phase: 'ASAP', priority: 1, notes: 'Negotiate long-stay rate. Confirm WiFi + power backup.' },
      { title: 'Get travel insurance with helicopter evacuation', category: 'HEALTH', phase: 'ASAP', priority: 1, notes: 'Helicopter evacuation can cost ₹2–5L. Non-negotiable.' },
      { title: 'Consult doctor re: Diamox (acetazolamide)', category: 'HEALTH', phase: 'ASAP', priority: 1, notes: 'Altitude sickness prevention. Prescription required.' },
      { title: 'Notify work team about schedule', category: 'WORK_SETUP', phase: 'ASAP', priority: 2, notes: 'Mornings 8–1pm for work, afternoons for exploration.' },
      { title: 'Buy trekking boots (waterproof, ankle support)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'Break them in for 3–4 weeks.' },
      { title: 'Order SPF 50+ sunscreen (×2 large bottles)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'UV at 3,500m is brutal.' },
      { title: 'UV-blocking wraparound sunglasses', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'UV intensity is 40% higher at this altitude.' },
      { title: 'Down or fleece jacket', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1 },
      { title: 'Thermal base layers (top + bottom)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Warm hat and gloves (for Khardung La + Pangong nights)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Waterproof outer shell jacket', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Portable power bank 20,000mAh+', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Power strip with surge protection', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Noise-cancelling headphones', category: 'WORK_SETUP', phase: 'MONTH_BEFORE', priority: 2 },
      { title: 'Assemble full medical kit', category: 'HEALTH', phase: 'MONTH_BEFORE', priority: 1, notes: 'Diamox + ibuprofen + ORS + Imodium + antiseptic + SPF lip balm' },
      { title: 'Download offline maps (Maps.me + Google Maps)', category: 'WORK_SETUP', phase: 'MONTH_BEFORE', priority: 1, notes: 'Essential outside Leh where internet drops to zero.' },
      { title: 'Book Weekend Trek 1 agency (Sham Valley)', category: 'TRANSPORT', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
      { title: 'Book Weekend Trek 2 transport (Nubra Valley)', category: 'TRANSPORT', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
      { title: 'Book Pangong Tso lakeside camp', category: 'ACCOMMODATION', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
      { title: 'Get passport photos ×10', category: 'DOCUMENTS', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
      { title: 'Photocopy all ID documents ×5 each', category: 'DOCUMENTS', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
      { title: 'Notify bank about travel + cash plan', category: 'MONEY', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: 'Carry ₹20,000–30,000 cash. ATMs disappear outside Leh.' },
      { title: 'Withdraw ₹15,000–20,000 cash', category: 'MONEY', phase: 'WEEK_BEFORE', priority: 1 },
      { title: 'Print hotel + booking confirmations', category: 'DOCUMENTS', phase: 'WEEK_BEFORE', priority: 1 },
      { title: 'Confirm flight + web check-in', category: 'FLIGHTS', phase: 'WEEK_BEFORE', priority: 1 },
      { title: 'Pack reusable 1L water bottle', category: 'GEAR', phase: 'WEEK_BEFORE', priority: 1, notes: 'Drink 3L+/day at altitude.' },
      { title: 'Share hotel address + SNM Hospital number with family', category: 'DOCUMENTS', phase: 'WEEK_BEFORE', priority: 1, notes: 'SNM Hospital Leh: +91 1982 252014' },
      { title: 'Set early morning alarm', category: 'MISC', phase: 'DAY_BEFORE', priority: 1 },
      { title: 'No alcohol 24h before altitude exposure', category: 'HEALTH', phase: 'DAY_BEFORE', priority: 1 },
      { title: 'Final bag check — warm layers + laptop + docs', category: 'GEAR', phase: 'DAY_BEFORE', priority: 1 },
      { title: 'Absolute rest on arrival — Days 1 & 2', category: 'HEALTH', phase: 'ON_TRIP', priority: 1, notes: 'No exertion, no alcohol, drink 3L water.' },
      { title: 'Get Airtel/BSNL Ladakh SIM (airport or Main Market)', category: 'WORK_SETUP', phase: 'ON_TRIP', priority: 1 },
      { title: 'Get ILP permits at DC Office (Day 3–4)', category: 'PERMITS', phase: 'ON_TRIP', priority: 1, notes: 'DC Office near Main Market. Mon–Sat 10am–4pm.' },
      { title: 'Find trusted local taxi driver (Day 1–2)', category: 'TRANSPORT', phase: 'ON_TRIP', priority: 1 },
      { title: 'Always carry ₹5,000–10,000 cash when leaving Leh', category: 'MONEY', phase: 'ON_TRIP', priority: 1 },
    ]})

    // Itinerary Days
    await db.itineraryDay.deleteMany()
    const days = [
      { dayNumber: 1, dayOfWeek: 'Sat', title: '🛬 Arrive Leh — Absolute Rest Day', isWorkDay: false, isTrekDay: false, isExcursionDay: false, isFestivalDay: true, description: 'Fly into Kushok Bakula Rimpochee Airport. Transfer to accommodation. DO NOT exert yourself. Drink 3L water. Short stroll to Main Market in the evening only if you feel fine. No alcohol for 48 hours.', dinnerNote: 'Bon Appetit or Amdo Food' },
      { dayNumber: 2, dayOfWeek: 'Sun', title: '🎭 Phyang Tsedup Festival — Day 1', isWorkDay: false, isTrekDay: false, isExcursionDay: true, isFestivalDay: true, description: 'Hire a local taxi to Phyang Monastery (17km). Witness the Cham masked dances and the dramatic unfurling of the giant Thangka.', lunchNote: 'Festival stalls at Phyang', dinnerNote: 'The Tibetan Kitchen, Leh' },
      { dayNumber: 3, dayOfWeek: 'Mon', title: '🖥 Work Day + Old Town Orientation', isWorkDay: true, isExcursionDay: true, description: 'First proper work morning. Set up workflow 9am–1pm. Afternoon: walk Old Town, Soma Gompa, Main Bazaar. Evening at Leh Palace viewpoint for sunset.', lunchNote: 'Namza Café', dinnerNote: 'Open Sky Restaurant' },
      { dayNumber: 4, dayOfWeek: 'Tue', title: '🖥 Deep Work + Shanti Stupa', isWorkDay: true, isExcursionDay: true, description: 'Full morning work session from Coffee Culture Leh. Afternoon walk to Shanti Stupa (20 min hike) — incredible 360° views of Leh Valley.', lunchNote: 'Coffee Culture Leh', dinnerNote: 'Bon Appetit Restaurant' },
      { dayNumber: 5, dayOfWeek: 'Wed', title: '🖥 Work + Leh Palace & Hall of Fame', isWorkDay: true, isExcursionDay: true, description: 'Work morning. Afternoon: Leh Palace (₹25 entry). Then Hall of Fame museum. Evening: Main Market shopping.', lunchNote: 'Leh Town Café', dinnerNote: 'Chopsticks Restaurant' },
      { dayNumber: 6, dayOfWeek: 'Thu', title: '🖥 Work + Indus Valley Drive', isWorkDay: true, isExcursionDay: true, description: 'Work until 1pm. Afternoon taxi to Thiksey Monastery (19km) and Hemis Monastery (45km). Thiksey at sunset is stunning.', lunchNote: 'Spitok village dhaba', dinnerNote: 'Chopsticks, Leh' },
      { dayNumber: 7, dayOfWeek: 'Fri', title: '🖥 Work + Prep Weekend Trek', isWorkDay: true, description: 'Work morning. Confirm Weekend 1 trek booking. Pack gear, stock water and snacks. Early dinner and early sleep.', dinnerNote: 'The Tibetan Kitchen — early night' },
      { dayNumber: 8, dayOfWeek: 'Sat', title: '🥾 Weekend Trek 1 — Sham Valley Day 1', isWorkDay: false, isTrekDay: true, description: 'Guided hike through Sham Valley — Yangthang, Hemis Shukpachan villages. Traditional architecture, apricot orchards. Overnight homestay.', lunchNote: 'Agency-packed lunch on trail', dinnerNote: 'Village homestay meal' },
      { dayNumber: 9, dayOfWeek: 'Sun', title: '🥾 Trek Day 2 + Pangong Planning', isWorkDay: false, isTrekDay: true, description: "Complete Sham Valley Day 2 or rest in Leh. Plan Pangong Tso weekend trip — book taxi and confirm ILP permit.", breakfastNote: "Bob's Café (post-trek)" },
      { dayNumber: 10, dayOfWeek: 'Mon', title: '🖥 Productivity Day + Craft Bazaar', isWorkDay: true, isExcursionDay: true, description: 'Strong work day. Afternoon: Craft Bazaar behind Main Market — Tibetan jewellery, thangka, rugs. Evening: Lehvenda Café.', lunchNote: 'Neha Snacks, Main Bazaar', dinnerNote: 'Hotel dining' },
      { dayNumber: 11, dayOfWeek: 'Tue', title: '🖥 Work + Stok Palace Museum', isWorkDay: true, isExcursionDay: true, description: 'Morning work. Afternoon: Stok Village (15km) — Stok Palace Museum with royal artefacts and thangkas.', lunchNote: "Wanderer's Terrace", dinnerNote: 'Open Sky Café' },
      { dayNumber: 12, dayOfWeek: 'Wed', title: '🖥 Work + Sangam Confluence', isWorkDay: true, isExcursionDay: true, description: 'Work morning. Afternoon to Sangam — Indus and Zanskar river confluence (35km). Two-tone rivers merging in a dramatic gorge.', lunchNote: 'Roadside dhaba at Sangam', dinnerNote: 'Little Italy, Leh' },
      { dayNumber: 13, dayOfWeek: 'Thu', title: '🖥 Work + Nubra Valley Planning', isWorkDay: true, description: 'Work until 2pm. Book Weekend 2 transport to Nubra Valley. Apply for ILP for Nubra. Afternoon rest.', dinnerNote: 'Tibetan Kitchen + early sleep' },
      { dayNumber: 14, dayOfWeek: 'Fri', title: '🖥 Work + Alchi Day Trip', isWorkDay: true, isExcursionDay: true, description: 'Half day work. Afternoon: Alchi Monastery (70km west) — 11th-century Tibetan Buddhist murals.', lunchNote: 'Alchi Kitchen Restaurant', dinnerNote: 'Back in Leh' },
      { dayNumber: 15, dayOfWeek: 'Sat', title: '🌄 Weekend 2 — Nubra Valley via Khardung La', isWorkDay: false, isExcursionDay: true, description: 'Early start (6am) to cross Khardung La (5,359m). Diskit Monastery + 32m Maitreya Buddha. Hunder sand dunes + Bactrian camel ride.', lunchNote: 'Sumur village café', dinnerNote: 'Campsite dinner' },
      { dayNumber: 16, dayOfWeek: 'Sun', title: '🌄 Nubra Day 2 — Turtuk Village', isWorkDay: false, isExcursionDay: true, description: "Drive to Turtuk (95km) — last accessible village before Pakistan's border. Apricot orchards, Balti culture.", lunchNote: 'Local Balti food in Turtuk', dinnerNote: 'Recovery meal in Leh' },
      { dayNumber: 17, dayOfWeek: 'Mon', title: '🖥 Recovery Work Day + Market', isWorkDay: true, description: 'Rest morning + lighter work schedule. Afternoon in Main Market. Stock up on apricot products, saffron, dried fruit.', dinnerNote: 'Light, in-town' },
      { dayNumber: 18, dayOfWeek: 'Tue', title: '🖥 Deep Work + Magnetic Hill', isWorkDay: true, isExcursionDay: true, description: 'Strong work morning. Afternoon: Magnetic Hill (30km) + Gurudwara Pathar Sahib free langar + Likir Monastery.', lunchNote: 'Gurudwara Pathar Sahib langar (free)', dinnerNote: 'Bon Appetit' },
      { dayNumber: 19, dayOfWeek: 'Wed', title: '🖥 Work + Pangong Final Planning', isWorkDay: true, description: 'Work day. Confirm Pangong trip (permits + camp). Plan 5am departure Saturday. Pack camping warm layers.', dinnerNote: 'The Grand Dragon restaurant (splurge)' },
      { dayNumber: 20, dayOfWeek: 'Thu', title: '🖥 Final Work Day + Farewell Market', isWorkDay: true, isExcursionDay: true, description: 'Final full work day. Afternoon: last Main Market shopping — pashmina, jewellery, thangka art. Last sunset at Shanti Stupa.', dinnerNote: 'Long dinner at Chopsticks' },
      { dayNumber: 21, dayOfWeek: 'Fri', title: '🌅 Weekend 3 — Pangong Tso Departure', isWorkDay: false, isExcursionDay: true, description: "Pre-dawn start (5am) for Pangong Tso via Chang La (5,360m). Arrive by 11am at the iconic blue-green lake. Camp at the water's edge.", breakfastNote: 'Packed breakfast on road', lunchNote: 'Pangong campsite', dinnerNote: 'Lakeside camp dinner under stars' },
    ]

    for (const day of days) {
      await db.itineraryDay.upsert({
        where: { dayNumber: day.dayNumber },
        update: day,
        create: {
          ...day,
          isWorkDay: day.isWorkDay ?? true,
          isTrekDay: (day as { isTrekDay?: boolean }).isTrekDay ?? false,
          isExcursionDay: (day as { isExcursionDay?: boolean }).isExcursionDay ?? false,
          isFestivalDay: (day as { isFestivalDay?: boolean }).isFestivalDay ?? false,
        },
      })
    }

    // Shopping / souvenir repository — classic Ladakh buys by area.
    // Guarded so it won't crash if the ShopItem table isn't migrated yet.
    try {
      if ((await db.shopItem.count()) === 0) {
        await db.shopItem.createMany({ data: [
          { name: 'Pashmina shawl', area: 'Leh', category: 'Textiles', estPriceINR: 6000, whereToBuy: 'Moti Market / LAMO area, Leh', priority: 'must', notes: 'Insist on GI-tagged Changthangi pashmina; beware blends.' },
          { name: 'Apricot kernel oil & dried apricots', area: 'Nubra', category: 'Food', estPriceINR: 800, whereToBuy: 'Diskit / Turtuk roadside stalls', priority: 'must', notes: 'Turtuk apricots are famous — buy fresh and dried.' },
          { name: 'Thangka painting', area: 'Leh', category: 'Spiritual', estPriceINR: 4500, whereToBuy: 'Old Town Leh / Tibetan Refugee Market', priority: 'nice', notes: 'Hand-painted on cotton; ask about the school/lineage.' },
          { name: 'Prayer flags (Lungta)', area: 'Leh', category: 'Spiritual', estPriceINR: 250, whereToBuy: 'Main Bazaar, Leh', priority: 'nice', notes: 'Cheap, light, great gifts.' },
          { name: 'Ladakhi turquoise & coral jewellery (Perak)', area: 'Leh', category: 'Jewellery', estPriceINR: 3000, whereToBuy: 'Tibetan Refugee Market, Leh', priority: 'nice', notes: 'Haggle hard; check stones are real.' },
          { name: 'Sea buckthorn juice / jam', area: 'Leh', category: 'Food', estPriceINR: 400, whereToBuy: 'Leh Berry / local co-ops', priority: 'nice', notes: 'Local superfruit; juice and jam both travel well.' },
          { name: 'Yak wool / Nambu woollens', area: 'Sham', category: 'Textiles', estPriceINR: 2500, whereToBuy: 'Sham Valley village co-ops (Likir/Basgo)', priority: 'nice', notes: 'Hand-woven Nambu cloth; warm and authentic.' },
          { name: 'Pashmina socks / gloves', area: 'Leh', category: 'Textiles', estPriceINR: 900, whereToBuy: 'Women’s Alliance / SECMOL shop', priority: 'maybe', notes: 'Supports local women’s collectives.' },
          { name: 'Apricot scrub & soaps', area: 'Nubra', category: 'Misc', estPriceINR: 350, whereToBuy: 'Nubra village stalls', priority: 'maybe' },
          { name: 'Singing bowl', area: 'Leh', category: 'Spiritual', estPriceINR: 1800, whereToBuy: 'Old Town Leh', priority: 'maybe', notes: 'Test the tone before buying.' },
          { name: 'Pangong-stone fridge magnets / keepsakes', area: 'Pangong', category: 'Misc', estPriceINR: 200, whereToBuy: 'Spangmik tent-shops', priority: 'maybe', notes: 'Don’t pocket natural stones from the lakeshore — buy instead.' },
          { name: 'Organic Ladakhi barley (Ngamphe) & tsampa', area: 'Sham', category: 'Food', estPriceINR: 500, whereToBuy: 'Village homestays / co-ops', priority: 'maybe' },
        ]})
      }
    } catch (e) {
      console.warn('ShopItem seed skipped (run /api/migrate first):', e)
    }

    const counts = await Promise.all([
      db.flight.count(), db.stay.count(), db.trek.count(), db.event.count(),
      db.transport.count(), db.place.count(), db.checklistItem.count(), db.itineraryDay.count(),
    ])

    return NextResponse.json({
      success: true,
      message: '✅ Database seeded successfully!',
      counts: {
        flights: counts[0], stays: counts[1], treks: counts[2], events: counts[3],
        transport: counts[4], places: counts[5], checklist: counts[6], itinerary: counts[7],
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
