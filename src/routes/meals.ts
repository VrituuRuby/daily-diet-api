import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
	app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const createMealSchema = z.object({
			name: z.string(),
			description: z.string(),
			onDiet: z.boolean()
		})

		const { name, description, onDiet } = createMealSchema.parse(request.body)
		await knex('meals').insert({
			id: randomUUID(),
			name,
			description: description,
			onDiet
		})

		return reply.status(201).send()
	})

	app.get('/', async () => {
		const meals = await knex('meals').select('*')
		return { meals }
	})

	app.get('/:id', async (req: FastifyRequest) => {
		const getMealParams = z.object({
			id: z.string().uuid()
		})
		const { id } = getMealParams.parse(req.params)
		const meal = await knex('meals').where('id', id).select('*').first()

		return { meal }
	})
}