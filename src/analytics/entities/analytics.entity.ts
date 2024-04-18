import { URLEntity } from '@/urls/entities/urls.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('analytics')
export class AnalyticsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  device: string;

  @Column()
  platforms: string;

  @Column()
  referrer: string;

  @Column()
  browser: string;

  @Column()
  location: string;

  @Column()
  ip: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => URLEntity, (URLEntity) => URLEntity.analytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'url_id' })
  url: URLEntity;
}
