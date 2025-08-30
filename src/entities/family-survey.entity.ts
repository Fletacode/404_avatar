import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum RelationshipToDeceased {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER'
}

export enum PsychologicalSupportLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE'
}

@Entity('family_surveys')
export class FamilySurvey {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.familySurvey)
  @JoinColumn()
  user: User;

  @Column('date')
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: RelationshipToDeceased
  })
  relationshipToDeceased: RelationshipToDeceased;

  @Column({ nullable: true })
  relationshipDescription: string;

  @Column({
    type: 'enum',
    enum: PsychologicalSupportLevel
  })
  psychologicalSupportLevel: PsychologicalSupportLevel;

  @Column({ default: false })
  meetingParticipationDesire: boolean;

  @Column('text', { nullable: true })
  personalNotes: string;

  @Column({ default: false })
  privacyAgreement: boolean;

  @Column({ default: false })
  surveyCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
