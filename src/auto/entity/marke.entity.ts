import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Auto } from './auto.entity.js';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Marke {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column()
    @ApiProperty({ example: 'Mercedes', type: String })
    readonly name!: string;

    @Column()
    @ApiProperty({ example: 2004, type: Number })
    readonly gruendungsjahr!: number;

    @Column()
    @ApiProperty({ example: 'Ferdinand Porsche', type: String })
    readonly gruender!: string;

    @OneToMany(() => Auto, (auto) => auto.marke, {
        cascade: ['insert', 'remove'],
    })
    autos: Auto[] | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            gruendungsjahr: this.gruendungsjahr,
            gruender: this.gruender,
        });
}
