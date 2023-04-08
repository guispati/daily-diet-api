import { knex } from "../database";

export async function getLoggedUser(sessionId: string | undefined) {
    const user = await knex('users')
        .where('session_id', sessionId)
        .first();

    if (!user)
        throw new Error('Unauthorized');

    return user;
}