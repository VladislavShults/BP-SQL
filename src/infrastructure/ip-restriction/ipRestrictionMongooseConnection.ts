import { Mongoose } from 'mongoose';
import { IpRestrictionSchema } from './schemas/ip-restriction.schema';

export const ipRestrictionMongooseConnection = [
  {
    provide: 'IP_RESTRICTION_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('IP_RESTRICTION', IpRestrictionSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
