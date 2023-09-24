import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('meals', (table) => {
		table.uuid('id').primary()
		table.text('name').notNullable()
		table.text('description').notNullable()
		table.datetime('date').notNullable().defaultTo(knex.fn.now())
		table.boolean('onDiet').notNullable()
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('meals')
}
