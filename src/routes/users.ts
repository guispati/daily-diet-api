import { randomUUID } from 'node:crypto';
import { compare, hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from 'zod';

import { knex } from "../database";
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';
import { getLoggedUser } from '../utils/get-logged-user';
import { getBestSequenceOnDietInDays } from '../utils/get-best-sequence-on-diet-in-days';

export async function usersRoutes(app: FastifyInstance) {
    app.post('/authenticate', async (request, response) => {
        const authenticateUserBodySchema = z.object({
            email: z.string().email(),
            password: z.string(),
        });

        const { email, password } = authenticateUserBodySchema.parse(request.body);

        const userCheck = await knex('users')
            .where('email', email)
            .first();

        if (!userCheck) {
            throw new InvalidCredentialsError();
        }

        const doesPasswordMatches = await compare(password, userCheck.password_hash);

        if (!doesPasswordMatches) {
            throw new InvalidCredentialsError();
        }

        const sessionId = randomUUID();

        const user = await knex('users')
            .update({
                session_id: sessionId,
            })
            .where('id', userCheck.id)

        response.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return response.status(200).send();
    });
    
    app.post('/register', async (request, response) => {
        const registerUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
        });
        
        const { name, email, password } = registerUserBodySchema.parse(request.body);

        const userWithSameEmail = await knex('users')
            .where({
                email,
            })
            .first();

        if (userWithSameEmail) {
            throw new UserAlreadyExistsError();
        }

        const sessionId = randomUUID();
        const password_hash = await hash(password, 6);

        await knex('users').insert({
            id: randomUUID(),
            name,
            email,
            password_hash,
            session_id: sessionId,
        });

        response.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return response.status(201).send();
    });

    app.get('/metrics', {
        preHandler: [checkSessionIdExists],
    },  async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const meals = await knex('meals')
            .where({ user_id: user.id })
            .orderBy('date');

        const totalMeals = meals.length;
        const mealsInDiet = meals.filter(meal => meal.in_diet).length;
        const mealsNotInDiet = meals.filter(meal => !meal.in_diet).length;
        const bestSequenceOnDietInDays = getBestSequenceOnDietInDays(meals);

        return {
            totalMeals,
            mealsInDiet: mealsInDiet,
            mealsNotInDiet,
            bestSequenceOnDietInDays
        };
    });
}