import { sequelize } from './database';
import { User, Listing } from './models';

const sampleListings = [
  { name: 'The Grand Palace', location: 'Connaught Place, New Delhi', price_per_night: 150, amenities: JSON.stringify(['Pool', 'Spa', 'Free WiFi', 'Gym']) },
  { name: 'Sunset View Retreat', location: 'Connaught Place, New Delhi', price_per_night: 120, amenities: JSON.stringify(['Rooftop Bar', 'Free WiFi', 'Breakfast Included']) },
  { name: 'Urban Tech Hub Hotel', location: 'Cyber City, Gurugram', price_per_night: 200, amenities: JSON.stringify(['Co-working Space', 'Fast WiFi', 'Coffee Shop', 'Gym']) },
  { name: 'Cyber Inn', location: 'Cyber City, Gurugram', price_per_night: 90, amenities: JSON.stringify(['Free WiFi', 'AC', 'Breakfast Included']) },
  { name: 'Cozy Cottage Stay', location: 'Manali, Himachal Pradesh', price_per_night: 60, amenities: JSON.stringify(['Fireplace', 'Mountain View', 'Heating']) },
  { name: 'Himalayan Highs Resort', location: 'Manali, Himachal Pradesh', price_per_night: 250, amenities: JSON.stringify(['Ski Access', 'Spa', 'Fine Dining', 'Mountain View']) },
  { name: 'Beachfront Paradise', location: 'Baga Beach, Goa', price_per_night: 180, amenities: JSON.stringify(['Private Beach', 'Pool', 'Bar', 'Seafood Restaurant']) },
  { name: 'Goa Surf Shack', location: 'Anjuna Beach, Goa', price_per_night: 40, amenities: JSON.stringify(['Surfboard Rentals', 'Free WiFi', 'Hammocks']) },
  { name: 'Heritage Haveli', location: 'Jaipur, Rajasthan', price_per_night: 110, amenities: JSON.stringify(['Traditional Architecture', 'Courtyard', 'Folk Dance Shows', 'Restaurant']) },
  { name: 'Pink City Royal Stay', location: 'Jaipur, Rajasthan', price_per_night: 300, amenities: JSON.stringify(['Royal Suites', 'Pool', 'Spa', 'Guided Tours']) },
  { name: 'Lakeside Serenity', location: 'Udaipur, Rajasthan', price_per_night: 220, amenities: JSON.stringify(['Lake View', 'Boat Rides', 'Fine Dining', 'Rooftop Lounge']) },
  { name: 'Backwaters Houseboat', location: 'Alleppey, Kerala', price_per_night: 160, amenities: JSON.stringify(['Private Boat', 'Chef on board', 'AC Bedrooms']) },
  { name: 'Spice Garden Homestay', location: 'Munnar, Kerala', price_per_night: 50, amenities: JSON.stringify(['Garden Tour', 'Home Cooked Meals', 'Free WiFi']) },
  { name: 'Silicon Safari Hotel', location: 'Koramangala, Bengaluru', price_per_night: 130, amenities: JSON.stringify(['Fast WiFi', 'Gym', 'Breakfast Included', 'Pool']) },
  { name: 'Garden City Suites', location: 'Indiranagar, Bengaluru', price_per_night: 140, amenities: JSON.stringify(['Kitchenette', 'Free WiFi', 'Pet Friendly']) },
  { name: 'Marine Drive Luxury', location: 'South Mumbai', price_per_night: 350, amenities: JSON.stringify(['Ocean View', 'Spa', 'Infinity Pool', 'Valet Parking']) },
  { name: 'Bandra Boutique Hotel', location: 'Bandra West, Mumbai', price_per_night: 170, amenities: JSON.stringify(['Chic Cafe', 'Free WiFi', 'Art Gallery']) },
  { name: 'Taj View Residency', location: 'Agra, Uttar Pradesh', price_per_night: 190, amenities: JSON.stringify(['Taj Mahal View', 'Pool', 'Restaurant', 'Guide Services']) },
  { name: 'Nawabi Heritage Stay', location: 'Lucknow, Uttar Pradesh', price_per_night: 100, amenities: JSON.stringify(['Avadhi Cuisine', 'Traditional Decor', 'Free WiFi']) },
  { name: 'Darjeeling Tea Estate', location: 'Darjeeling, West Bengal', price_per_night: 210, amenities: JSON.stringify(['Tea Tasting', 'Mountain View', 'Fireplace', 'Library']) }
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
