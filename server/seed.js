import mongoose from 'mongoose';
import Resource from './models/Resource.js';
import dotenv from 'dotenv';

dotenv.config();

const resources = [
  { name: 'Fire Trucks', type: 'truck', total: 20, deployed: 18 },
  { name: 'Ambulances', type: 'ambulance', total: 30, deployed: 24 },
  { name: 'Rescue Boats', type: 'boat', total: 15, deployed: 12 },
  { name: 'Survey Drones', type: 'drone', total: 10, deployed: 8 },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crisischain');
        await Resource.deleteMany({});
        await Resource.insertMany(resources);
        console.log('Database seeded with resources');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedDB();
