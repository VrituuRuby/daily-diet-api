import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('users', (table) => {
		table.uuid('id').primary()
		table.string('name').notNullable()
		table.string('email').notNullable()
		table.string('password').notNullable()
	})

	await knex.schema.alterTable('meals', table => {
		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('users')
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('users')
	await knex.schema.alterTable('meals', table => {
		table.dropColumn('user_id')
	})
}

