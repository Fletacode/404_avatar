import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Counselor } from './counselor.entity';
import { FamilyGroup } from './family-group.entity';

export enum MatchingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MatchingType {
  COUNSELOR = 'COUNSELOR',
  FAMILY_GROUP = 'FAMILY_GROUP'
}

@Entity('matchings')
export class Matching {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    default: MatchingType.COUNSELOR
  })
  type: MatchingType;

  @Column({
    type: 'text',
    default: MatchingStatus.PENDING
  })
  status: MatchingStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  matchScore: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  rejectionReason: string;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Counselor, counselor => counselor.matchings, { nullable: true })
  @JoinColumn()
  counselor: Counselor;

  @Column({ nullable: true })
  counselorId: number;

  @ManyToOne(() => FamilyGroup, familyGroup => familyGroup.matchings, { nullable: true })
  @JoinColumn()
  familyGroup: FamilyGroup;

  @Column({ nullable: true })
  familyGroupId: number;
}
