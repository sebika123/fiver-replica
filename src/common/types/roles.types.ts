import { registerEnumType } from '@nestjs/graphql';
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
registerEnumType(UserRole, {
  name: 'UserRole',
});
registerEnumType(UserGender, {
  name: 'UserGender',
});
