export const Component = {
  RestApplication: Symbol.for('RestApplication'),
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  DB: Symbol.for('DB'),
  UserService : Symbol.for('UserService'),
  RentalOfferService: Symbol.for('RentalOfferService'),
} as const;
