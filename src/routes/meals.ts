import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { verifyJwtToken } from '../middleware/verify-jwt-token'

export async function mealsRoutes(app: FastifyInstance) {
	app.post('/', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
		const { user_id } = request
		const createMealSchema = z.object({
			name: z.string(),
			description: z.string(),
			onDiet: z.boolean(),
			date: z.string().optional()
		})

		const { description, name, onDiet, date } = createMealSchema.parse(request.body)
		const meal = await knex('meals').insert({
			id: randomUUID(),
			name,
			date: date ? new Date(date) : new Date(),
			description,
			onDiet,
			user_id
		}).returning('*')

		return reply.status(201).send({ meal })
	})

	app.get('/', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest) => {
		const { user_id } = request
		const meals = await knex('meals').where({ user_id }).select('*')
		return { meals }
	})

	app.get('/:id', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest, reply: FastifyReply) => {

		const { user_id } = request

		const getMealParams = z.object({
			id: z.string().uuid()
		})

		const { id } = getMealParams.parse(request.params)
		const meal = await knex('meals').where({ id }).select('*').first()
		if (meal?.user_id !== user_id) return reply.status(401).send({ error: 'Unauthorized' })

		return { meal }
	})

	app.put('/:id', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
		const getMealParams = z.object({
			id: z.string().uuid(),
		})

		const { id } = getMealParams.parse(request.params)

		const meal = await knex('meals').where({ id }).first()

		const { user_id } = request

		if (!meal) return reply.status(404).send({ error: 'Meal not found' })

		if (meal.user_id !== user_id) return reply.status(401).send({ error: 'Unauthorized' })

		const updateMealSchema = z.object({
			name: z.string().optional(),
			description: z.string().optional(),
			onDiet: z.boolean().optional(),
			date: z.string().optional()
		})

		const { description, name, onDiet, date } = updateMealSchema.parse(request.body)

		const newMeal = await knex('meals').where({ id }).update({
			description: description || meal.description,
			name: name || meal.id,
			onDiet: onDiet || meal.onDiet,
			date: date || meal.date
		}).returning('*')

		return reply.send({ meal: newMeal })
	})

	app.delete('/:id', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
		const { user_id } = request
		const getMealIdParamSchema = z.object({
			id: z.string().uuid()
		})
		const { id } = getMealIdParamSchema.parse(request.params)

		const mealExists = await knex('meals').where({ id }).first()

		if (!mealExists) return reply.status(404).send({ error: 'Meal not found' })
		if (mealExists.user_id !== user_id) return reply.status(401).send({ error: 'Unauthorized' })

		await knex('meals').where({ id }).delete()

		return reply.status(204).send()
	})
}