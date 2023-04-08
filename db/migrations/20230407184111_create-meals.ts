import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.text('description'),
        table.dateTime('date').notNullable();
        table.boolean('in_diet').notNullable(),
        table.uuid('user_id').notNullable(),
        
        table.foreign('user_id').references('id').inTable('users')
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}

