import { sequelize } from './src/db/database.ts';
import { User, Listing } from './src/db/models.ts';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    const users = await User.count();
    console.log('Users count:', users);
    const listings = await Listing.count();
    console.log('Listings count:', listings);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
test();
