import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Matching } from './matching.entity';
import { RelationshipToDeceased } from './family-survey.entity';
import { AgeGroup } from './counselor.entity';

export enum MeetingType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID'
}

export enum FamilyGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL'
}

@Entity('family_groups')
export class FamilyGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column({
    type: 'text',
    default: MeetingType.OFFLINE
  })
  meetingType: MeetingType;

  @Column('text', { default: '[]' })
  targetRelationships: string; // JSON string of RelationshipToDeceased[]

  @Column('text', { default: '[]' })
  targetAgeGroups: string; // JSON string of AgeGroup[]

  @Column({ type: 'int', default: 15 })
  maxMembers: number;

  @Column({ type: 'int', default: 0 })
  currentMembers: number;

  @Column({ type: 'datetime', nullable: true })
  nextMeetingDate: Date;

  @Column()
  leaderName: string;

  @Column({ nullable: true })
  leaderEmail: string;

  @Column({ nullable: true })
  leaderPhone: string;

  @Column({
    type: 'text',
    default: FamilyGroupStatus.ACTIVE
  })
  status: FamilyGroupStatus;

  @Column('text', { nullable: true })
  meetingDetails: string; // 모임 상세 정보

  @Column({ type: 'text', nullable: true })
  requirements: string; // 참가 조건

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Matching, matching => matching.familyGroup)
  matchings: Matching[];
}
