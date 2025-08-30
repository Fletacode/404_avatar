import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn } from 'typeorm';
import { Board } from './board.entity';
import { FamilySurvey } from './family-survey.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Board, board => board.user)
  boards: Board[];

  @OneToOne(() => FamilySurvey, familySurvey => familySurvey.user)
  familySurvey: FamilySurvey;
}
