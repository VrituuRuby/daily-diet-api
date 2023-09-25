import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '../database'
import { z } from 'zod'
import { hash } from 'bcrypt'

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
}