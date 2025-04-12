import { Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
 } from "typeorm";
import {Auto} from './auto.entity.js';
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Marke{
    @PrimaryGeneratedColumn()
    id : number | undefined;

    @Column()
    @ApiProperty({example: "Mercedes", type: String})
    readonly name! : string;

    @Column()
    @ApiProperty({example: 2004, type: Number})
    readonly gründungsjahr! : number

    @Column()
    @ApiProperty({example: "Ferdinand Porsche", type: String})
    readonly gründer! : string

    @OneToMany(() => Auto, (auto) => auto.marke, {
            cascade: ['insert', 'remove'],
        })
    autos : Auto[] | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name : this.name,
            gründungsjahr : this.gründungsjahr,
            gründer : this.gründer
        });
}