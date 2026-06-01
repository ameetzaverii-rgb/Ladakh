import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌄 Seeding Leh Ladakh Workation database...')

  // Trip Config
  await prisma.tripConfig.upsert({
    where: { id: 'trip-config-1' },
    update: {},
    create: {
      id: 'trip-config-1',
      tripStartDate: new Date('2026-07-22'),
      tripEndDate: new Date('2026-08-11'),
      totalBudgetINR: 150000,
      homeCity: 'Delhi',
      travelerName: 'Amit',
    },
  })

  // Flights
  await prisma.flight.deleteMany()
  await prisma.flight.createMany({ data: [
    { origin: 'DEL', destination: 'IXL', airline: 'IndiGo', flightNumber: '6E 2041', departureTime: '07:00', durationMins: 75, priceINR: 7200, available: true, bookingUrl: 'https://www.goindigo.in/', notes: 'Earliest morning flight, best views on approach' },
    { origin: 'DEL', destination: 'IXL', airline: 'Air India', flightNumber: 'AI 444', departureTime: '07:30', durationMins: 80, priceINR: 8500, available: true, bookingUrl: 'https://www.airindia.in/', notes: 'Reliable, good baggage allowance' },
    { origin: 'DEL', destination: 'IXL', airline: 'SpiceJet', flightNumber: 'SG 122', departureTime: '09:00', durationMins: 80, priceINR: 6800, available: true, notes: 'Budget option — book early' },
    { origin: 'DEL', destination: 'IXL', airline: 'IndiGo', flightNumber: '6E 2043', departureTime: '14:00', durationMins: 75, priceINR: 9500, available: true, notes: 'Afternoon option' },
    { origin: 'IXL', destination: 'DEL', airline: 'IndiGo', flightNumber: '6E 2042', departureTime: '10:00', durationMins: 75, priceINR: 7000, available: true, notes: 'Return flight option' },
    { origin: 'IXL', destination: 'DEL', airline: 'Air India', flightNumber: 'AI 445', departureTime: '11:00', durationMins: 80, priceINR: 8200, available: true, notes: 'Mid-morning return' },
  ]})

  // Stays
  await prisma.stay.deleteMany()
  await prisma.stay.createMany({ data: [
    { name: 'The Grand Dragon Ladakh', type: 'HOTEL', neighbourhood: 'Fort Road', pricePerNightINR: 8500, priceMonthlyINR: 160000, wifiRating: 5, hasCoworking: true, hasPowerBackup: true, viewType: 'Stok Kangri range', breakfastIncl: true, available: true, bookingUrl: 'https://www.thegranddragonladakh.com/', description: "Leh's best-known upscale property. Consistent fiber internet, panoramic mountain views, reliable power backup. Perfect for serious workation.", highlights: ['Great WiFi', 'Mountain View', 'Coworking Space', 'Breakfast Included'] },
    { name: 'The Bodhi Tree Ladakh', type: 'HOTEL', neighbourhood: 'Changspa', pricePerNightINR: 6000, priceMonthlyINR: 120000, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, viewType: 'Zanskar and Stok views', breakfastIncl: true, available: true, description: 'Boutique property with gorgeous garden, Zanskar and Stok views, excellent breakfast included. Calm, focused atmosphere ideal for deep work weeks.', highlights: ['Mountain View', 'Garden', 'Breakfast Included', 'Boutique'] },
    { name: 'Hotel Ladakh Retreat', type: 'HOTEL', neighbourhood: 'Changspa Road', pricePerNightINR: 4000, priceMonthlyINR: 67500, wifiRating: 4, hasCoworking: true, hasPowerBackup: true, viewType: 'Mountain and garden', breakfastIncl: false, available: true, description: 'Coworking spaces on-site, lush garden, reliable WiFi, balconies with mountain view. Business centre + meeting rooms — genuinely workation-ready.', highlights: ['Coworking', 'Business Centre', 'Garden Views'] },
    { name: 'Woosah Hostel', type: 'HOSTEL', neighbourhood: 'Central Leh', pricePerNightINR: 2000, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, breakfastIncl: false, available: true, description: "One of Leh's top-rated workation hostels. Fast WiFi, power backup, great common areas, community of long-stay travelers.", highlights: ['Community', 'Fast WiFi', 'Digital Nomad Friendly'] },
    { name: 'Dejavu Hostel Leh', type: 'HOSTEL', neighbourhood: 'Old Town', pricePerNightINR: 1500, wifiRating: 4, hasCoworking: false, hasPowerBackup: true, viewType: 'Leh Palace views from rooftop', breakfastIncl: false, available: true, description: 'Solid WiFi, clean rooms, rooftop with Leh Palace views, laundry facilities, helpful staff.', highlights: ['Rooftop Views', 'Laundry', 'Leh Palace View'] },
    { name: 'Skitpo Guest House', type: 'GUESTHOUSE', neighbourhood: 'Changspa', pricePerNightINR: 2750, wifiRating: 3, hasCoworking: false, hasPowerBackup: true, viewType: 'Panoramic mountain views', breakfastIncl: false, available: true, description: 'Near Shanti Stupa, 15-min walk to Main Market. Panoramic mountain views, power backup. Great value mid-tier option.', highlights: ['Palace Views', 'WiFi', 'Mountain Panorama'] },
  ]})

  // Treks
  await prisma.trek.deleteMany()
  await prisma.trek.createMany({ data: [
    { name: 'Sham Valley Trek (Village Circuit)', difficulty: 'EASY', durationDays: 2, maxAltitudeM: 4100, distanceKm: 25, startPoint: 'Leh', permitRequired: false, priceINR: 3500, company: 'Ju-Leh Adventure', companyUrl: 'https://ju-lehadventure.com', available: true, season: 'June–September', description: 'The gentlest introduction to Ladakhi trekking. Ancient villages, apricot orchards, monasteries on cliffs. 2-day with village homestay overnight.', highlights: ['Ribbok monastery', 'Yak meadows', 'Village homestay', 'Traditional architecture'] },
    { name: 'Stok Kangri Base Camp Day Trek', difficulty: 'MEDIUM', durationDays: 1, maxAltitudeM: 4800, distanceKm: 12, startPoint: 'Stok Village (15km from Leh)', permitRequired: false, priceINR: 2000, company: 'Overland Escape', companyUrl: 'https://overlandescape.com', available: true, season: 'June–September', description: 'Most popular day hike from Leh. Stok Valley past glacial streams to Stok Kangri base camp. Jaw-dropping views of Karakoram and Zanskar ranges.', highlights: ['360° Karakoram views', 'Glacial streams', 'High-altitude meadows'] },
    { name: 'Markha Valley Trek (2-Day Section)', difficulty: 'HARD', durationDays: 2, maxAltitudeM: 5150, distanceKm: 30, startPoint: 'Skiu (40km from Leh by 4WD)', permitRequired: false, priceINR: 7500, company: 'Ancient Tracks', companyUrl: 'https://ancienttracks.com', available: true, season: 'June–September', description: "Ladakh's most famous multi-day trek. Cross the Markha River multiple times, remote villages, camping under impossible stars. 2-day section.", highlights: ['Kang Yatse peak views', 'Markha village gompa', 'Yak herders', 'Incredible solitude'] },
    { name: 'Pangong Lake Shore Walk', difficulty: 'EASY', durationDays: 1, maxAltitudeM: 4350, distanceKm: 8, startPoint: 'Pangong Tso lakeside camp', permitRequired: true, priceINR: 0, available: true, season: 'June–September', description: 'Gentle walk along the north shore past Spangmik and Merak villages. The lake colours shift from turquoise to cobalt as you walk — each km a different shade.', highlights: ['Colour-shifting lake', 'Spangmik village', 'Sunrise at water edge', 'Total silence'] },
    { name: 'Zanskar River Rafting', difficulty: 'MEDIUM', durationDays: 1, maxAltitudeM: 3000, distanceKm: 15, startPoint: 'Nimmu (45km from Leh)', permitRequired: false, priceINR: 2000, company: 'Explore Himalayas', available: true, season: 'July–September', description: 'Grade III–IV white water rafting on the Zanskar River near Nimmu. 3–4 hours on water. Best adrenaline addition to the workation.', highlights: ['Grade III-IV rapids', 'Canyon walls', 'Zanskar gorge'] },
  ]})

  // Events
  await prisma.event.deleteMany()
  await prisma.event.createMany({ data: [
    { name: 'Phyang Tsedup Festival', type: 'FESTIVAL', location: 'Phyang Monastery, 17km from Leh', startDate: new Date('2026-07-22'), endDate: new Date('2026-07-23'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 17, description: "One of Ladakh's most visually spectacular festivals. Sacred Cham masked dances, dramatic unfurling of the giant Thangka silk scroll.", tips: 'Arrive early morning (7am) before crowds. Taxi ₹800–1,200 return.' },
    { name: 'Korzok Gustor (Tso Moriri)', type: 'FESTIVAL', location: 'Korzok Monastery, Tso Moriri', startDate: new Date('2026-07-27'), endDate: new Date('2026-07-28'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 220, description: 'Annual monastery festival at remote Tso Moriri lake at 4,522m altitude. Cham dances. Combine with Tso Moriri overnight.', tips: 'Permit required. 5–6 hour drive from Leh.' },
    { name: 'Thiksey Monastery Morning Puja', type: 'MONASTERY', location: 'Thiksey Monastery, 19km from Leh', startDate: new Date('2026-07-25'), endDate: new Date('2026-07-25'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 19, description: 'Early morning prayer ceremony at Thiksey — chanting, drums, butter-lamps at 6am. One of the most photogenic monasteries in Ladakh.', tips: 'Arrive by 6am sharp. Donation-based.' },
    { name: 'Main Market Evening Bazaar', type: 'MARKET', location: 'Main Bazaar, Central Leh', startDate: new Date('2026-07-26'), endDate: new Date('2026-07-26'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 0, description: 'Main Market alive in the evening with stalls selling local crafts, pashmina, thangka paintings, dried apricots. Best shopping experience of the trip.', tips: 'Evening 6–9pm peak time. Cash only. Lanes behind Jama Masjid have the best crafts.' },
    { name: 'Shanti Stupa Stargazing', type: 'ASTRONOMY', location: 'Shanti Stupa, Leh', startDate: new Date('2026-07-30'), endDate: new Date('2026-07-30'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 1, description: 'Some of India\'s darkest skies. The Milky Way is a solid river of light at 3,600m. Best on new moon nights.', tips: 'Bring a warm jacket (8°C at night). Best around new moon.' },
    { name: 'Ladakh Festival (Bonus — if you extend)', type: 'FESTIVAL', location: 'Leh, Polo Grounds', startDate: new Date('2026-09-21'), endDate: new Date('2026-09-24'), ticketRequired: false, freeEntry: true, distanceFromLehKm: 0, description: "Ladakh's biggest festival. Archery, polo, traditional music, folk dances, monastery performances. If you can extend by 2 weeks — unmissable.", tips: 'Book accommodation 3–4 months ahead.' },
  ]})

  // Transport
  await prisma.transport.deleteMany()
  await prisma.transport.createMany({ data: [
    { type: 'TAXI', destination: 'Leh ↔ Thiksey + Hemis circuit', distanceKm: 50, rateINR: 2000, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 4, notes: 'Half-day excursion — afternoon run works well' },
    { type: 'TAXI', destination: 'Leh ↔ Phyang Monastery', distanceKm: 17, rateINR: 1000, rateType: 'return', permitRequired: false, permitTypes: [], durationHours: 1, notes: 'Festival taxi — negotiate for wait time' },
    { type: 'TAXI', destination: 'Leh ↔ Shanti Stupa', distanceKm: 4, rateINR: 400, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.25, notes: 'Can also walk — 20 min from Changspa' },
    { type: 'TAXI', destination: 'Leh ↔ Sangam Confluence', distanceKm: 35, rateINR: 2200, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 3, notes: 'Indus-Zanskar confluence' },
    { type: 'TAXI', destination: 'Leh ↔ Alchi Monastery', distanceKm: 70, rateINR: 3400, rateType: 'full-day', permitRequired: false, permitTypes: [], durationHours: 6, notes: '11th-century murals — cultural crown jewel' },
    { type: 'TAXI', destination: 'Leh ↔ Pangong Tso (one way)', distanceKm: 160, rateINR: 5750, rateType: 'one-way', permitRequired: true, permitTypes: ['ILP', 'RAP'], permitCostINR: 400, durationHours: 3.5, notes: 'Via Chang La 5,360m' },
    { type: 'TAXI', destination: 'Leh ↔ Nubra Valley 2-day', distanceKm: 120, rateINR: 7000, rateType: '2-day', permitRequired: true, permitTypes: ['ILP'], permitCostINR: 400, durationHours: 5, notes: 'Via Khardung La 5,359m' },
    { type: 'TAXI', destination: 'Leh ↔ Stok village', distanceKm: 15, rateINR: 750, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.5, notes: 'Drop for Stok Kangri base camp hike' },
    { type: 'TAXI', destination: 'Leh ↔ Lamayuru', distanceKm: 125, rateINR: 4200, rateType: 'full-day', permitRequired: false, permitTypes: [], durationHours: 7, notes: 'Moonscape landscape — combine with Alchi + Likir' },
    { type: 'TAXI', destination: 'Leh ↔ Magnetic Hill + circuit', distanceKm: 30, rateINR: 2300, rateType: 'half-day', permitRequired: false, permitTypes: [], durationHours: 3, notes: 'Magnetic Hill + Gurudwara Pathar Sahib + Likir' },
    { type: 'TAXI', destination: 'Airport Transfer', distanceKm: 5, rateINR: 500, rateType: 'one-way', permitRequired: false, permitTypes: [], durationHours: 0.25, notes: 'Kushok Bakula Airport to Leh town' },
    { type: 'BIKE_RENTAL', destination: 'Leh & surrounds (per day)', distanceKm: 0, rateINR: 1600, rateType: 'per-day', permitRequired: false, permitTypes: [], notes: 'Royal Enfield Himalayan or 500cc Bullet. Experienced riders only.' },
  ]})

  // Places
  await prisma.place.deleteMany()
  await prisma.place.createMany({ data: [
    { name: 'Lehvenda Café', type: 'CAFE', neighbourhood: 'Changspa', description: "Consistently Leh's best café. Exceptional specialty coffee, extraordinary tea selection, mountain views from terrace. Go-to for long afternoon work sessions.", mustOrder: ['Specialty pour-over', 'Himalayan tea', 'Apricot pastry'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 400, openNow: true, seasonal: true, tags: ['Best Overall', 'Work-Friendly', 'Mountain Views'] },
    { name: 'Open Sky Café', type: 'CAFE', neighbourhood: 'Fort Road', description: 'Legendary rooftop with the best panoramic view of Leh. Coffee, cakes, and Western meals. Always full by 11am — come early or late afternoon.', mustOrder: ['Apricot cake', 'Cold brew', 'Eggs benedict'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 500, openNow: true, seasonal: true, tags: ['Best Rooftop', 'Spectacular Views'] },
    { name: 'Coffee Culture Leh', type: 'CAFE', neighbourhood: 'Central Leh', description: 'The coworking café for remote workers in Leh. Modern, fast WiFi, good espresso, laptop-friendly. One of few places with true coworking infrastructure.', mustOrder: ['Americano', 'BLT sandwich', 'Sea buckthorn smoothie'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 350, openNow: true, seasonal: true, tags: ['Coworking Hub', 'Fast WiFi', 'Power Outlets'] },
    { name: 'Namza Café', type: 'CAFE', neighbourhood: 'Changspa', description: 'Charming, quiet, local ingredients. Healthy bowls, salads, fresh juices. Most Ladakhi-feeling of the cafés — authentic, great for a long lunch break.', mustOrder: ['Khambir sandwich', 'Sea buckthorn juice', 'Local salad'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 300, openNow: true, seasonal: true, tags: ['Local Ingredients', 'Quiet', 'Healthy'] },
    { name: 'Leh Town Café', type: 'CAFE', neighbourhood: 'Fort Road', description: 'Brilliant ambiance, books and guitar to borrow, modern interiors. Famous for iris and hazelnut coffees. The caramel cappuccino is reportedly the best in Leh.', mustOrder: ['Iris cappuccino', 'Paneer sandwich', 'Hazelnut latte'], wifiAvailable: true, laptopFriendly: true, avgBudgetINR: 380, openNow: true, seasonal: true, tags: ['Best Coffee', 'Books & Music'] },
    { name: "Bob's Café", type: 'CAFE', neighbourhood: 'Central Leh', description: 'Cozy institution beloved by trekkers. Perfect post-trek recovery spot. Great coffee, enormous portions, warm vibe. Excellent local advice from owner.', mustOrder: ['Full breakfast', 'Mint lemon tea', 'French toast'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 350, openNow: true, seasonal: true, tags: ['Trekker Favourite', 'Cozy'] },
    { name: 'The Tibetan Kitchen', type: 'RESTAURANT', neighbourhood: 'Fort Road', description: 'Best momos in Leh, full stop. Authentic Tibetan-Ladakhi menu, excellent thukpa, friendly staff. Must-visit at least twice.', mustOrder: ['Yak meat momo', 'Skyu', 'Thukpa', 'Butter tea'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 450, openNow: true, seasonal: true, tags: ['Best Momos', 'Authentic Ladakhi'] },
    { name: 'Bon Appetit', type: 'RESTAURANT', neighbourhood: 'Changspa', description: 'Popular with long-stay travellers. Multi-cuisine menu, reasonable prices, consistent quality. Good for Western breakfast or reliable dinner.', mustOrder: ['Full English breakfast', 'Pasta', 'Lasagne'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 550, openNow: true, seasonal: true, tags: ['Multi-Cuisine', 'Long Stay Favourite'] },
    { name: 'Neha Snacks (Main Bazaar)', type: 'STREET_FOOD', neighbourhood: 'Main Bazaar', description: 'Local favourite for quick bites — momos, thukpa, samosas, pakoras. Bustling, cheap, authentic. Quick lunch between work and afternoon excursion.', mustOrder: ['Steamed momos', 'Samosa', 'Aloo tikki'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 150, openNow: true, seasonal: true, tags: ['Street Food', 'Budget'] },
    { name: 'Chopsticks', type: 'RESTAURANT', neighbourhood: 'Main Market', description: "Leh's best Chinese-Tibetan restaurant. Noodles, dumplings, fried rice done properly. Comfort food go-to mid-trip.", mustOrder: ['Wonton soup', 'Fried rice', 'Spring rolls'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 600, openNow: true, seasonal: true, tags: ['Chinese-Tibetan', 'Comfort Food'] },
    { name: 'Little Italy', type: 'RESTAURANT', neighbourhood: 'Main Market', description: 'Surprisingly excellent Italian at altitude. Great pizzas, pasta, salads. Good mid-trip break from Ladakhi food.', mustOrder: ['Margherita pizza', 'Penne arrabbiata', 'Tiramisu'], wifiAvailable: false, laptopFriendly: false, avgBudgetINR: 700, openNow: true, seasonal: true, tags: ['Italian', 'Good Break'] },
    { name: "Wanderer's Terrace", type: 'RESTAURANT', neighbourhood: 'Fort Road', description: 'Rooftop restaurant, sweeping Leh views, good multi-cuisine menu. Evening atmosphere is wonderful.', mustOrder: ['Dal makhani', 'Paneer tikka', 'Cold beer'], wifiAvailable: true, laptopFriendly: false, avgBudgetINR: 750, openNow: true, seasonal: true, tags: ['Rooftop', 'Sunset Views'] },
  ]})

  // Preparation Checklist
  await prisma.checklistItem.deleteMany()
  await prisma.checklistItem.createMany({ data: [
    // ASAP
    { title: 'Book Delhi–Leh flight (return, July 22 dep)', category: 'FLIGHTS', phase: 'ASAP', priority: 1, notes: 'Book 6–8 weeks ahead. Morning flights for best views.' },
    { title: 'Book accommodation for 21 nights', category: 'ACCOMMODATION', phase: 'ASAP', priority: 1, notes: 'Negotiate long-stay rate. Confirm WiFi + power backup.' },
    { title: 'Get travel insurance with helicopter evacuation', category: 'HEALTH', phase: 'ASAP', priority: 1, notes: 'Helicopter evacuation from remote areas can cost ₹2–5L. Non-negotiable.' },
    { title: 'Consult doctor re: Diamox (acetazolamide)', category: 'HEALTH', phase: 'ASAP', priority: 1, notes: 'Altitude sickness prevention. Prescription required. Start 1 day before arrival.' },
    { title: 'Notify work team about schedule', category: 'WORK_SETUP', phase: 'ASAP', priority: 2, notes: 'Mornings 8–1pm for work, afternoons for exploration. Set expectations.' },
    // MONTH_BEFORE
    { title: 'Buy trekking boots (waterproof, ankle support)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'Break them in for 3–4 weeks. Non-negotiable for treks.' },
    { title: 'Order SPF 50+ sunscreen (×2 large bottles)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'UV at 3,500m is brutal.' },
    { title: 'UV-blocking wraparound sunglasses', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1, notes: 'UV intensity is 40% higher at this altitude. Mountaineering-grade essential.' },
    { title: 'Down or fleece jacket', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 1 },
    { title: 'Thermal base layers (top + bottom)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Warm hat and gloves (for Khardung La + Pangong nights)', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Waterproof outer shell jacket', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Neck gaiter / buff', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Portable power bank 20,000mAh+', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Power strip with surge protection', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Camera with UV filter', category: 'GEAR', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Noise-cancelling headphones', category: 'WORK_SETUP', phase: 'MONTH_BEFORE', priority: 2 },
    { title: 'Assemble full medical kit', category: 'HEALTH', phase: 'MONTH_BEFORE', priority: 1, notes: 'Diamox + ibuprofen + ORS + Imodium + antiseptic + lip balm SPF30+' },
    { title: 'Download offline maps (Maps.me + Google Maps)', category: 'WORK_SETUP', phase: 'MONTH_BEFORE', priority: 1, notes: 'Essential outside Leh where internet drops to zero.' },
    // TWO_WEEKS_BEFORE
    { title: 'Book Weekend Trek 1 agency (Sham Valley)', category: 'TRANSPORT', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: 'Ju-Leh Adventure or similar. Confirm date for Days 8–9.' },
    { title: 'Book Weekend Trek 2 transport (Nubra Valley)', category: 'TRANSPORT', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: '₹6,500–7,000 for 2-day taxi via Khardung La.' },
    { title: 'Book Pangong Tso lakeside camp (Day 21+)', category: 'ACCOMMODATION', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: '₹1,500–3,000/night with meals. Book near Spangmik.' },
    { title: 'Get passport photos ×10', category: 'DOCUMENTS', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: 'For permits and hotel check-ins.' },
    { title: 'Photocopy all ID documents ×5 each', category: 'DOCUMENTS', phase: 'TWO_WEEKS_BEFORE', priority: 1 },
    { title: 'Notify bank about travel + cash plan', category: 'MONEY', phase: 'TWO_WEEKS_BEFORE', priority: 1, notes: 'Carry ₹20,000–30,000 cash. ATMs disappear outside Leh.' },
    { title: 'Set up async work protocols for offline days', category: 'WORK_SETUP', phase: 'TWO_WEEKS_BEFORE', priority: 2 },
    // WEEK_BEFORE
    { title: 'Withdraw ₹15,000–20,000 cash', category: 'MONEY', phase: 'WEEK_BEFORE', priority: 1 },
    { title: 'Print hotel + booking confirmations', category: 'DOCUMENTS', phase: 'WEEK_BEFORE', priority: 1 },
    { title: 'Confirm flight + web check-in', category: 'FLIGHTS', phase: 'WEEK_BEFORE', priority: 1 },
    { title: 'Charge all devices + power banks', category: 'GEAR', phase: 'WEEK_BEFORE', priority: 2 },
    { title: 'Pack reusable 1L water bottle', category: 'GEAR', phase: 'WEEK_BEFORE', priority: 1, notes: 'Drink 3L+/day at altitude. Reduce plastic waste.' },
    { title: 'Share hotel address + SNM Hospital number with family', category: 'DOCUMENTS', phase: 'WEEK_BEFORE', priority: 1, notes: 'SNM Hospital Leh: +91 1982 252014' },
    // DAY_BEFORE
    { title: 'Set early morning alarm', category: 'MISC', phase: 'DAY_BEFORE', priority: 1 },
    { title: 'No alcohol 24h before altitude exposure', category: 'HEALTH', phase: 'DAY_BEFORE', priority: 1, notes: 'Alcohol worsens AMS. None on the plane either.' },
    { title: 'Final bag check — warm layers + laptop + docs', category: 'GEAR', phase: 'DAY_BEFORE', priority: 1 },
    // ON_TRIP
    { title: 'Absolute rest on arrival — Days 1 & 2', category: 'HEALTH', phase: 'ON_TRIP', priority: 1, notes: 'No exertion, no alcohol, drink 3L water. This is not optional.' },
    { title: 'Get Airtel/BSNL Ladakh SIM (airport or Main Market)', category: 'WORK_SETUP', phase: 'ON_TRIP', priority: 1 },
    { title: 'Get ILP permits at DC Office (Day 3–4)', category: 'PERMITS', phase: 'ON_TRIP', priority: 1, notes: 'DC Office near Main Market. Mon–Sat 10am–4pm. Bring photos + ID copies.' },
    { title: 'Find trusted local taxi driver (Day 1–2)', category: 'TRANSPORT', phase: 'ON_TRIP', priority: 1, notes: 'Ask hotel reception. Single driver = better rates for 21 days.' },
    { title: 'Test Ladakh Coworking Hub + Coffee Culture Leh WiFi', category: 'WORK_SETUP', phase: 'ON_TRIP', priority: 2 },
    { title: 'Always carry ₹5,000–10,000 cash when leaving Leh', category: 'MONEY', phase: 'ON_TRIP', priority: 1 },
  ]})

  // Itinerary Days
  await prisma.itineraryDay.deleteMany()
  const days = [
    { dayNumber: 1, dayOfWeek: 'Sat', title: '🛬 Arrive Leh — Absolute Rest Day', isWorkDay: false, isTrekDay: false, isExcursionDay: false, isFestivalDay: true, description: "Fly into Kushok Bakula Rimpochee Airport (morning flight for best views). Transfer to accommodation. DO NOT exert yourself. Unpack slowly. Drink 3L water. Short stroll to Main Market in the evening only if you feel fine. No alcohol for 48 hours. Check Phyang Monastery timing for tomorrow.", lunchNote: 'Room service or hotel', dinnerNote: 'Bon Appetit or Amdo Food — gentle walk only' },
    { dayNumber: 2, dayOfWeek: 'Sun', title: '🎭 Phyang Tsedup Festival — Day 1', isWorkDay: false, isTrekDay: false, isExcursionDay: true, isFestivalDay: true, description: "Hire a local taxi to Phyang Monastery (17km). Witness the Cham masked dances and the dramatic unfurling of the giant Thangka. One of Ladakh's most visually spectacular festivals. Return to Leh by afternoon. Rest.", lunchNote: 'Festival stalls at Phyang', dinnerNote: 'The Tibetan Kitchen, Leh' },
    { dayNumber: 3, dayOfWeek: 'Mon', title: '🖥 Work Day + Old Town Orientation', isWorkDay: true, isExcursionDay: true, description: 'First proper work morning from hotel WiFi or Ladakh Coworking Hub. Set up workflow. 9am–1pm. Afternoon: walk Old Town, Soma Gompa, Main Bazaar. Evening at Leh Palace viewpoint for sunset.', breakfastNote: 'Hotel', lunchNote: 'Namza Café', dinnerNote: 'Open Sky Restaurant' },
    { dayNumber: 4, dayOfWeek: 'Tue', title: '🖥 Deep Work + Shanti Stupa', isWorkDay: true, isExcursionDay: true, description: 'Full morning work session from Coffee Culture Leh. Afternoon walk to Shanti Stupa (20 min hike) — incredible 360° views of Leh Valley. Evening café strip walk.', lunchNote: 'Coffee Culture Leh (work here)', dinnerNote: 'Bon Appetit Restaurant' },
    { dayNumber: 5, dayOfWeek: 'Wed', title: '🖥 Work + Leh Palace & Hall of Fame', isWorkDay: true, isExcursionDay: true, description: 'Work morning. Afternoon: Leh Palace (₹25 entry, 400-year-old Namgyal dynasty palace). Then Hall of Fame museum. Evening: Main Market shopping.', lunchNote: 'Leh Town Café (Fort Road)', dinnerNote: 'Chopsticks Restaurant' },
    { dayNumber: 6, dayOfWeek: 'Thu', title: '🖥 Work + Indus Valley Drive', isWorkDay: true, isExcursionDay: true, description: 'Work until 1pm. Afternoon taxi to Thiksey Monastery (19km) and Hemis Monastery (45km). Thiksey at sunset is stunning.', lunchNote: 'Spitok village dhaba', dinnerNote: 'Chopsticks, Leh' },
    { dayNumber: 7, dayOfWeek: 'Fri', title: '🖥 Work + Prep Weekend Trek', isWorkDay: true, description: 'Work morning. Confirm Weekend 1 trek booking with agency. Pack gear, stock water and snacks. Early dinner and early sleep.', dinnerNote: 'The Tibetan Kitchen — early night by 9pm' },
    { dayNumber: 8, dayOfWeek: 'Sat', title: '🥾 Weekend Trek 1 — Sham Valley Day 1', isWorkDay: false, isTrekDay: true, description: 'Guided hike through Sham Valley — Yangthang, Hemis Shukpachan villages. Traditional architecture, apricot orchards, monasteries on cliffs. Overnight homestay with local family. Butter tea.', lunchNote: 'Agency-packed lunch on trail', dinnerNote: 'Village homestay meal' },
    { dayNumber: 9, dayOfWeek: 'Sun', title: '🥾 Trek Day 2 or Recovery + Pangong Planning', isWorkDay: false, isTrekDay: true, description: "Complete Sham Valley Day 2 or rest in Leh. Plan Pangong Tso weekend trip — book taxi and confirm ILP permit. Review Bob's Café post-trek.", breakfastNote: "Bob's Café (post-trek)", dinnerNote: 'Julelay Restaurant' },
    { dayNumber: 10, dayOfWeek: 'Mon', title: '🖥 Productivity Day + Craft Bazaar', isWorkDay: true, isExcursionDay: true, description: 'Strong work day. Afternoon: Craft Bazaar behind Main Market — Tibetan jewellery, thangka, rugs. Evening: Lehvenda Café for long sunset coffee session.', lunchNote: 'Neha Snacks, Main Bazaar', dinnerNote: 'Hotel dining' },
    { dayNumber: 11, dayOfWeek: 'Tue', title: '🖥 Work + Stok Palace Museum', isWorkDay: true, isExcursionDay: true, description: 'Morning work. Afternoon: Stok Village (15km) — Stok Palace Museum with royal artefacts and thangkas. Gentle 2km walk through apricot orchards.', lunchNote: "Wanderer's Terrace", dinnerNote: 'Open Sky Café' },
    { dayNumber: 12, dayOfWeek: 'Wed', title: '🖥 Work + Sangam Confluence', isWorkDay: true, isExcursionDay: true, description: 'Work morning. Afternoon to Sangam — Indus and Zanskar river confluence (35km). Two-tone rivers merging in a dramatic gorge. Taxi ~₹2,200.', lunchNote: 'Roadside dhaba at Sangam', dinnerNote: 'Little Italy, Leh' },
    { dayNumber: 13, dayOfWeek: 'Thu', title: '🖥 Work + Nubra Valley Planning', isWorkDay: true, description: 'Work until 2pm. Book Weekend 2 transport to Nubra Valley. Apply for ILP for Nubra. Afternoon rest. Pack for the weekend.', dinnerNote: 'Tibetan Kitchen + early sleep' },
    { dayNumber: 14, dayOfWeek: 'Fri', title: '🖥 Work + Alchi Day Trip', isWorkDay: true, isExcursionDay: true, description: 'Half day work. Afternoon: Alchi Monastery (70km west) — 11th-century Tibetan Buddhist murals, unique art style. Cultural crown jewel of Ladakh. Taxi ~₹3,400.', lunchNote: 'Alchi Kitchen Restaurant (vegetarian, excellent)', dinnerNote: 'Back in Leh' },
    { dayNumber: 15, dayOfWeek: 'Sat', title: '🌄 Weekend 2 — Nubra Valley via Khardung La', isWorkDay: false, isExcursionDay: true, description: 'Early start (6am) to cross Khardung La (5,359m). Diskit Monastery + 32m Maitreya Buddha statue. Hunder sand dunes + Bactrian camel ride. Overnight at Nubra Valley campsite.', breakfastNote: 'Packed breakfast', lunchNote: 'Sumur village café', dinnerNote: 'Campsite dinner' },
    { dayNumber: 16, dayOfWeek: 'Sun', title: '🌄 Nubra Day 2 — Turtuk Village', isWorkDay: false, isExcursionDay: true, description: "Drive to Turtuk (95km) — last accessible village before Pakistan's border. Apricot orchards, Balti culture, narrow lanes. Return to Leh via Khardung La.", lunchNote: 'Local Balti food in Turtuk', dinnerNote: 'Recovery meal in Leh' },
    { dayNumber: 17, dayOfWeek: 'Mon', title: '🖥 Recovery Work Day + Market', isWorkDay: true, description: 'Rest morning + lighter work schedule. Afternoon in Main Market. Stock up on apricot products, saffron, dried fruit. Evening at Leh Town Café.', dinnerNote: 'Light, in-town' },
    { dayNumber: 18, dayOfWeek: 'Tue', title: '🖥 Deep Work + Magnetic Hill', isWorkDay: true, isExcursionDay: true, description: 'Strong work morning. Afternoon: Magnetic Hill (30km optical illusion) + Gurudwara Pathar Sahib free langar + Likir Monastery.', lunchNote: 'Gurudwara Pathar Sahib langar (free)', dinnerNote: 'Bon Appetit' },
    { dayNumber: 19, dayOfWeek: 'Wed', title: '🖥 Work + Pangong Final Planning', isWorkDay: true, description: 'Work day. Confirm Pangong trip (permits + camp). Plan 5am departure Saturday. Pack camping warm layers.', dinnerNote: 'The Grand Dragon restaurant (splurge)' },
    { dayNumber: 20, dayOfWeek: 'Thu', title: '🖥 Final Work Day + Farewell Market', isWorkDay: true, isExcursionDay: true, description: 'Final full work day. Afternoon: last Main Market shopping — pashmina, jewellery, thangka art, yak wool blankets. Last sunset at Shanti Stupa.', dinnerNote: 'Long dinner at Chopsticks' },
    { dayNumber: 21, dayOfWeek: 'Fri', title: '🌅 Weekend 3 — Pangong Tso Departure', isWorkDay: false, isExcursionDay: true, description: "Pre-dawn start (5am) for Pangong Tso via Chang La (5,360m). Arrive by 11am at the iconic blue-green lake. Camp at the water's edge — colour-shifting water, starlit skies, total silence. The crown jewel of Ladakh.", breakfastNote: 'Packed breakfast on road', lunchNote: 'Pangong campsite', dinnerNote: 'Lakeside camp dinner under stars' },
  ]

  for (const day of days) {
    await prisma.itineraryDay.upsert({
      where: { dayNumber: day.dayNumber },
      update: day,
      create: {
        ...day,
        isWorkDay: day.isWorkDay ?? true,
        isTrekDay: day.isTrekDay ?? false,
        isExcursionDay: day.isExcursionDay ?? false,
        isFestivalDay: day.isFestivalDay ?? false,
      },
    })
  }

  console.log('✅ Seed complete!')
  const counts = await Promise.all([
    prisma.flight.count(),
    prisma.stay.count(),
    prisma.trek.count(),
    prisma.event.count(),
    prisma.transport.count(),
    prisma.place.count(),
    prisma.checklistItem.count(),
    prisma.itineraryDay.count(),
  ])
  const labels = ['Flights', 'Stays', 'Treks', 'Events', 'Transport', 'Places', 'Checklist items', 'Itinerary days']
  labels.forEach((l, i) => console.log(`   ${l}: ${counts[i]}`))
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
