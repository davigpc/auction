/* Executa as migracoes do TypeORM a partir do codigo compilado.
 *
 * A imagem de producao nao tem ts-node nem o diretorio src, entao o glob de
 * migracoes do data-source de desenvolvimento nao serve. Este script aponta
 * para dist/database/migrations.
 */
const path = require('path');
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [path.join(__dirname, '..', 'dist', '**', '*.entity.js')],
  migrations: [
    path.join(__dirname, '..', 'dist', '**', 'migrations', '*.js'),
  ],
  synchronize: false,
});

async function main() {
  await dataSource.initialize();
  const applied = await dataSource.runMigrations();
  await dataSource.destroy();
  console.log(JSON.stringify({ migrationsApplied: applied.length }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
