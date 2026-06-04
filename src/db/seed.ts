import { sequelize } from './database';
import { User, Listing } from './models';

const sampleListings = [
  { id: '1b10a2eb-256d-4720-bf86-53dc9a473e1f', name: 'The Grand Palace', location: 'Connaught Place, New Delhi', price_per_night: 150, amenities: JSON.stringify(['Pool', 'Spa', 'Free WiFi', 'Gym']) },
  { id: '286ba642-1e9d-4c3e-8f55-1f9f2343b593', name: 'Sunset View Retreat', location: 'Connaught Place, New Delhi', price_per_night: 120, amenities: JSON.stringify(['Rooftop Bar', 'Free WiFi', 'Breakfast Included']) },
  { id: '3f6c1891-9e5c-4573-b778-9a3b8fc7d9fc', name: 'Urban Tech Hub Hotel', location: 'Cyber City, Gurugram', price_per_night: 200, amenities: JSON.stringify(['Co-working Space', 'Fast WiFi', 'Coffee Shop', 'Gym']) },
  { id: '407d1bae-eeb6-419b-ab87-434800bbaae3', name: 'Cyber Inn', location: 'Cyber City, Gurugram', price_per_night: 90, amenities: JSON.stringify(['Free WiFi', 'AC', 'Breakfast Included']) },
  { id: '5cd3d59e-1dc6-4841-86a0-47debcb3ffb9', name: 'Cozy Cottage Stay', location: 'Manali, Himachal Pradesh', price_per_night: 60, amenities: JSON.stringify(['Fireplace', 'Mountain View', 'Heating']) },
  { id: '6a42a048-fb6a-493d-bd88-51f67f08da62', name: 'Himalayan Highs Resort', location: 'Manali, Himachal Pradesh', price_per_night: 250, amenities: JSON.stringify(['Ski Access', 'Spa', 'Fine Dining', 'Mountain View']) },
  { id: '7251bc89-4bba-4e94-8452-9b2f6efba9d9', name: 'Beachfront Paradise', location: 'Baga Beach, Goa', price_per_night: 180, amenities: JSON.stringify(['Private Beach', 'Pool', 'Bar', 'Seafood Restaurant']) },
  { id: '8ae4cbb3-a3d8-4be8-bd57-a3a8e31a1969', name: 'Goa Surf Shack', location: 'Anjuna Beach, Goa', price_per_night: 40, amenities: JSON.stringify(['Surfboard Rentals', 'Free WiFi', 'Hammocks']) },
  { id: '900b998d-e6b8-4c12-9c16-e5cf92b8d4f4', name: 'Heritage Haveli', location: 'Jaipur, Rajasthan', price_per_night: 110, amenities: JSON.stringify(['Traditional Architecture', 'Courtyard', 'Folk Dance Shows', 'Restaurant']) },
  { id: 'a4ecba56-1cb7-4a0b-8d07-6ba012a6479f', name: 'Pink City Royal Stay', location: 'Jaipur, Rajasthan', price_per_night: 300, amenities: JSON.stringify(['Royal Suites', 'Pool', 'Spa', 'Guided Tours']) },
  { id: 'b0e01ea3-f5c9-4a0b-b152-7e04f0d36cfa', name: 'Lakeside Serenity', location: 'Udaipur, Rajasthan', price_per_night: 220, amenities: JSON.stringify(['Lake View', 'Boat Rides', 'Fine Dining', 'Rooftop Lounge']) },
  { id: 'ca0ee135-188b-4b13-9f89-8d752fca03e0', name: 'Backwaters Houseboat', location: 'Alleppey, Kerala', price_per_night: 160, amenities: JSON.stringify(['Private Boat', 'Chef on board', 'AC Bedrooms']) },
  { id: 'd7c86eaa-7419-450f-a9cb-b295bcf07dae', name: 'Spice Garden Homestay', location: 'Munnar, Kerala', price_per_night: 50, amenities: JSON.stringify(['Garden Tour', 'Home Cooked Meals', 'Free WiFi']) },
  { id: 'eabb19de-fe3d-4c31-9a74-d4f1345eeacf', name: 'Silicon Safari Hotel', location: 'Koramangala, Bengaluru', price_per_night: 130, amenities: JSON.stringify(['Fast WiFi', 'Gym', 'Breakfast Included', 'Pool']) },
  { id: 'f87a8e52-f472-4eaf-8c85-2e690f05db09', name: 'Garden City Suites', location: 'Indiranagar, Bengaluru', price_per_night: 140, amenities: JSON.stringify(['Kitchenette', 'Free WiFi', 'Pet Friendly']) },
  { id: '8a418e7c-23dd-44ee-9c40-3e5ce1f3e5c2', name: 'Marine Drive Luxury', location: 'South Mumbai', price_per_night: 350, amenities: JSON.stringify(['Ocean View', 'Spa', 'Infinity Pool', 'Valet Parking']) },
  { id: '58f55412-4489-4dd7-914a-0f51f0039b1e', name: 'Bandra Boutique Hotel', location: 'Bandra West, Mumbai', price_per_night: 170, amenities: JSON.stringify(['Chic Cafe', 'Free WiFi', 'Art Gallery']) },
  { id: '097deeb9-813a-4db3-ae09-282bb74b0ed6', name: 'Taj View Residency', location: 'Agra, Uttar Pradesh', price_per_night: 190, amenities: JSON.stringify(['Taj Mahal View', 'Pool', 'Restaurant', 'Guide Services']) },
  { id: 'ae485ff7-8509-4bf9-a9a3-5757d544ac4d', name: 'Nawabi Heritage Stay', location: 'Lucknow, Uttar Pradesh', price_per_night: 100, amenities: JSON.stringify(['Avadhi Cuisine', 'Traditional Decor', 'Free WiFi']) },
  { id: '1cd8c1dd-eaaf-4c3c-b26a-9f5da64cf2ed', name: 'Darjeeling Tea Estate', location: 'Darjeeling, West Bengal', price_per_night: 210, amenities: JSON.stringify(['Tea Tasting', 'Mountain View', 'Fireplace', 'Library']) }
];

export async function seedDatabase() {
  console.log('Syncing database...');
  await sequelize.sync({ force: true }); // Resets database

  console.log('Seeding fake user...');
  await User.create({
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Test Setup User',
    email: 'testuser@example.com'
  });

  console.log('Seeding listings...');
  for (const listing of sampleListings) {
    await Listing.create(listing);
  }

  console.log('Database seeded successfully.');
}

import { fileURLToPath } from 'url';

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
