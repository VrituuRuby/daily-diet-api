import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '../database'
import { z } from 'zod'
import { hash } from 'bcrypt'
import { verifyJwtToken } from '../middleware/verify-jwt-token'
import { Tables } from 'knex/types/tables'
import { listenerCount } from 'node:events'

export async function usersRoutes(app: FastifyInstance) {
	app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const createUserSchema = z.object({
			name: z.string().nonempty(),
			email: z.string().email(),
			password: z.string()
		})

		const { email, name, password } = createUserSchema.parse(request.body)

		const existingEmail = await knex('users').where('email', email).first()

		if (existingEmail) return reply.status(409).send({ error: 'Email is already in use' })

		await knex('users').insert({
			id: randomUUID(),
			email,
			password: await hash(password, 8),
			name
		})

		return reply.status(201).send()
	})

	app.put('/', { preHandler: verifyJwtToken }, async (request: FastifyRequest, reply: FastifyReply) => {
		const { user_id } = request

		const user = await knex('users').where('id', user_id!).select().first()

		if (!user) return reply.status(404).send({ error: 'User not found' })

		const updateUserSchema = z.object({
			name: z.string().optional(),
			email: z.string().email().optional(),
			password: z.string().optional()
		})

		const { email, name, password } = updateUserSchema.parse(request.body)

		if (email) {
			const existingEmailUser = await knex('users').where('email', email).first()
			if (existingEmailUser && existingEmailUser.id !== user_id) return reply.status(409).send({ error: 'Email is already in use' })
		}

		const newUser = await knex('users').where('id', user_id).update({
			email: email || user.email,
			name: name || user.name,
			password: password ? await hash(password, 8) : user.password
		}).returning('*')

		return reply.status(201).send()
	})

	app.get('/metrics', { preHandler: [verifyJwtToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
		const { user_id } = request

		const user = await knex('users').where({ id: user_id }).first().select('email')
		const allUserMeals = await knex('meals').where({ user_id }).select('*')

		const totalMeals = allUserMeals.length
		const totalInDietMeals = allUserMeals.filter(meal => meal.onDiet).length
		const totalOutOfDietMeals = allUserMeals.filter(meal => !meal.onDiet).length
		const bestSequenceOfOnDietMeals = findLongestDietSequence(allUserMeals)

		function findLongestDietSequence(meals: Tables['meals'][]) {
			meals.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
			let maxSequenceLength = 0
			let currentSequenceLength = 0

			for (const meal of meals) {
				if (meal.onDiet) {
					currentSequenceLength++
				} else {
					currentSequenceLength = 0
				}
				if (currentSequenceLength > maxSequenceLength) maxSequenceLength = currentSequenceLength
			}

			return maxSequenceLength
		}

		return {
			user,
			metrics: {
				totalMeals,
				totalInDietMeals,
				totalOutOfDietMeals,
				bestSequenceOfOnDietMeals
			}
		}
	})
}