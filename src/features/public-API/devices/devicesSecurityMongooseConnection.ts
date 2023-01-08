import { Mongoose } from 'mongoose';
import { DevicesSecuritySchema } from './schemas/devices.schema';

export const devicesSecurityMongooseConnection = [
  {
    provide: 'DEVICE_SECURITY_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('DEVICE_SECURITY', DevicesSecuritySchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
