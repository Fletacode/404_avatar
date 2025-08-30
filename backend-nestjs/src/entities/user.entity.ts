import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn } from 'typeorm';
import { Board } from './board.entity';
import { FamilySurvey, RelationshipToDeceased, PsychologicalSupportLevel } from './family-survey.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: false })
  isAdmin: boolean;

  // 설문조사 관련 필드들 (회원가입 시 입력)
  @Column('date', { nullable: true })
  birthDate: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  relationshipToDeceased: RelationshipToDeceased;

  @Column({ nullable: true })
  relationshipDescription: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  psychologicalSupportLevel: PsychologicalSupportLevel;

  @Column({ default: false })
  meetingParticipationDesire: boolean;

  @Column('text', { nullable: true })
  personalNotes: string;

  @Column({ default: false })
  privacyAgreement: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Board, board => board.user)
  boards: Board[];

  @OneToOne(() => FamilySurvey, familySurvey => familySurvey.user)
  familySurvey: FamilySurvey;
}
