import { PlansEnum } from '@/lib/enums/plans.enum';
import { ProviderEnum } from '@/lib/enums/provider.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ type: 'enum', enum: ProviderEnum })
  provider!: ProviderEnum;

  @Column({ type: 'enum', default: PlansEnum.FREE, enum: PlansEnum })
  plan: PlansEnum;

  @Column()
  email_verified: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
