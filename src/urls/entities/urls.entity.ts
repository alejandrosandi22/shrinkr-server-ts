import { UserEntity } from '@/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('urls')
export class URLEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  original_url!: string;

  @Column({ nullable: false, unique: true })
  short_url!: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  expiration_date: Date;

  @Column({ default: true })
  active!: boolean;

  @Column({ nullable: true, unique: true })
  custom_alias: string;

  @Column({ default: 0 })
  request_count!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.urls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
