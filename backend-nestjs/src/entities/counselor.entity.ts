import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Matching } from './matching.entity';
import { RelationshipToDeceased, PsychologicalSupportLevel } from './family-survey.entity';

export enum CounselorSpecialty {
  GRIEF_COUNSELING = 'GRIEF_COUNSELING',
  FAMILY_THERAPY = 'FAMILY_THERAPY',
  TRAUMA_THERAPY = 'TRAUMA_THERAPY',
  GROUP_THERAPY = 'GROUP_THERAPY',
  CHILD_COUNSELING = 'CHILD_COUNSELING',
  ELDERLY_COUNSELING = 'ELDERLY_COUNSELING'
}

export enum AgeGroup {
  CHILD = 'CHILD',      // 0-18세
  YOUNG_ADULT = 'YOUNG_ADULT',  // 19-35세
  MIDDLE_AGED = 'MIDDLE_AGED',  // 36-55세
  SENIOR = 'SENIOR'     // 56세 이상
}

export enum CounselorStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE'
}

@Entity('counselors')
export class Counselor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  licenseNumber: string;

  @Column('text')
  specialty: CounselorSpecialty;

  @Column('text', { default: '[]' })
  specializedRelationships: string;

  @Column('text', { default: '[]' })
  supportLevels: string;

  @Column('text', { default: '[]' })
  specializedAgeGroups: string;

  @Column('text')
  introduction: string;

  @Column('text', { nullable: true })
  education: string;

  @Column('text', { nullable: true })
  experience: string;

  @Column({ type: 'int', default: 0 })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({
    type: 'text',
    default: CounselorStatus.AVAILABLE
  })
  status: CounselorStatus;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @Column({ type: 'int', default: 0 })
  maxClientsPerDay: number;

  @Column({ type: 'int', default: 0 })
  currentClientsToday: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Matching, matching => matching.counselor)
  matchings: Matching[];
}
