// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string
            name: string,
            description: string
            date?: Date,
            onDiet: boolean
        }
        users: {
            id: string
            name: string,
            email: string
            password: string
        }
    }
}