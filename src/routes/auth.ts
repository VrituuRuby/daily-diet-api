import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'
import { knex } from '../database'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import env from '../env'

export async function authRoutes(app: FastifyInstance) {
	app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const signInSchema = z.object({
			email: z.string().email(),
			password: z.string()
		})

		const { email, password } = signInSchema.parse(request.body)

		const user = await knex('users').where({ email }).first()

		if (!user) return reply.status(400).send({ error: 'Wrong credentials' })
		if (!await compare(password, user.password)) return reply.status(400).send({ error: 'Wrong credentials' })

		const { password: _, ...userData } = user

		const token = sign({ sub: user.id }, env.JWT_TOKEN, { expiresIn: '7d' })

		return { userData, token }
	})

}