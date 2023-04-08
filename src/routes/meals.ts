import { randomUUID } from 'node:crypto';
import { FastifyInstance } from "fastify";
import { z } from 'zod';

import { knex } from "../database";
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';
import { getLoggedUser } from '../utils/get-logged-user';

export async function mealsRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionIdExists],
    }, async (request) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const meals = await knex('meals')
            .where('user_id', user.id)
            .select();

        return { meals };
    });

    app.post('/', {
        preHandler: [checkSessionIdExists],
    }, async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string().nullable(),
            date: z.string().datetime(),
            in_diet: z.boolean(),
        });

        const { name, description, date, in_diet } = createMealBodySchema.parse(request.body);
        
        await knex('meals').insert({
            id: randomUUID(),
            name,
            description: description ? description : null,
            date: new Date(date),
            in_diet,
            user_id: user.id,
        });

        return response.status(201).send();
    });

    app.put('/:id_meal', {
        preHandler: [checkSessionIdExists],
    },  async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const mealParamSchema = z.object({
            id_meal: z.string(),
        });
    
        const { id_meal } = mealParamSchema.parse(request.params);

        const checkMeal = await knex('meals')
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .first();

        if (!checkMeal) {
            return response.status(400).send({ message: 'Meal not found' });
        }

        const updateMealBodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            date: z.string().datetime().optional(),
            in_diet: z.boolean().optional(),
        });
    
        const { name, description, date, in_diet } = updateMealBodySchema.parse(request.body);
    
        const meal = await knex('meals')
            .update({
                name,
                description,
                date: date ? new Date(date) : undefined,
                in_diet
            })
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .returning('*');
    
        return {
            meal
        }
    });

    app.delete('/:id_meal', {
        preHandler: [checkSessionIdExists],
    },  async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const mealParamSchema = z.object({
            id_meal: z.string(),
        });
    
        const { id_meal } = mealParamSchema.parse(request.params);

        const checkMeal = await knex('meals')
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .first();

        if (!checkMeal) {
            return response.status(400).send({ message: 'Meal not found' });
        }
    
        await knex('meals')
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .del();
    
        return response.status(204).send();
    });

    app.get('/:id_meal', {
        preHandler: [checkSessionIdExists],
    },  async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await getLoggedUser(sessionId);

        const mealParamSchema = z.object({
            id_meal: z.string(),
        });
    
        const { id_meal } = mealParamSchema.parse(request.params);

        const checkMeal = await knex('meals')
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .first();

        if (!checkMeal) {
            return response.status(400).send({ message: 'Meal not found' });
        }
    
        const meal = await knex('meals')
            .where({
                id: id_meal,
                user_id: user.id,
            })
            .first();
    
        return {
            meal,
        };
    });
}