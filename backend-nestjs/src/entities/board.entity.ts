import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  author: string;

  @ManyToOne(() => User, user => user.boards)
  user: User;

  @ManyToOne(() => Category, category => category.boards)
  category: Category;

  @Column({ default: false })
  isAdminPost: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @OneToMany(() => Comment, comment => comment.board, { cascade: true })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
