import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string;
            session_id?: string;
            name: string;
            email: string;
            password_hash: string;
            created_at: string;
        },

        meals: {
            id: string;
            name: string;
            description: string | null;
            date: Date;
            in_diet: boolean;

            user_id: string;
        }
    }
}