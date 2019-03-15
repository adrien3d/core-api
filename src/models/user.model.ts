import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    unique: true,
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'boolean',
  })
  active?: boolean;

  @property({
    type: 'string',
  })
  activationKey?: string;

  @property({
    type: 'string',
  })
  resetKey?: string;

  @property({
    type: 'boolean',
  })
  admin?: boolean;

  @property({
    type: 'number',
  })
  lastAccess?: number;


  constructor(data?: Partial<User>) {
    super(data);
  }
}
