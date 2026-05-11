import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './database';

// ---- User Model ----
export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// ---- Listing Model ----
export class Listing extends Model {
  declare id: string;
  declare name: string;
  declare location: string;
  declare price_per_night: number;
  declare amenities: string;
  declare available: boolean;
}

Listing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_per_night: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.TEXT, // Storing as JSON string
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: false,
  }
);

// ---- Booking Model ----
export class Booking extends Model {
  declare id: string;
  declare user_id: string;
  declare listing_id: string;
  declare check_in: Date;
  declare check_out: Date;
  declare status: string;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    listing_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'listings',
        key: 'id',
      },
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'confirmed',
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Define Associations
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Listing.hasMany(Booking, { foreignKey: 'listing_id' });
Booking.belongsTo(Listing, { foreignKey: 'listing_id' });
