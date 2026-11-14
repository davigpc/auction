/* Seed deterministico do leilao para o experimento.
 *
 * Roda dentro do container da API, com as variaveis DATABASE_* do compose.
 * Apaga o estado anterior e cria dois usuarios, tres tipos de carta, tres
 * cartas e um leilao ativo com duracao longa (nao fecha durante a medicao).
 *
 * Imprime um JSON que o harness usa para descobrir o auctionId.
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const PASSWORD = 'password123';

const client = new Client({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function main() {
  await client.connect();

  await client.query(
    'TRUNCATE card_transfers, bids, auctions, cards, card_types, users RESTART IDENTITY CASCADE',
  );

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const sellerId = crypto.randomUUID();
  const bidderId = crypto.randomUUID();

  await client.query(
    `INSERT INTO users (id, email, username, password_hash)
     VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
    [
      sellerId,
      'seller@example.com',
      'seller',
      passwordHash,
      bidderId,
      'bidder@example.com',
      'bidder',
      passwordHash,
    ],
  );

  const cardTypes = [
    { id: crypto.randomUUID(), name: 'Lionel Messi', attack: 82, midfield: 64, defense: 71 },
    { id: crypto.randomUUID(), name: 'Cristiano Ronaldo', attack: 67, midfield: 76, defense: 48 },
    { id: crypto.randomUUID(), name: 'Neymar', attack: 95, midfield: 58, defense: 88 },
  ];

  for (const type of cardTypes) {
    await client.query(
      `INSERT INTO card_types (id, name, attack, midfield, defense)
       VALUES ($1, $2, $3, $4, $5)`,
      [type.id, type.name, type.attack, type.midfield, type.defense],
    );
  }

  const auctionCardId = crypto.randomUUID();
  const bidderCardId = crypto.randomUUID();
  const spareCardId = crypto.randomUUID();

  await client.query(
    `INSERT INTO cards (id, card_type_id, owner_user_id, status)
     VALUES ($1, $2, $3, 'LOCKED_IN_AUCTION'),
            ($4, $5, $6, 'OWNED'),
            ($7, $8, $9, 'OWNED')`,
    [
      auctionCardId,
      cardTypes[0].id,
      sellerId,
      bidderCardId,
      cardTypes[2].id,
      bidderId,
      spareCardId,
      cardTypes[1].id,
      sellerId,
    ],
  );

  const auctionId = crypto.randomUUID();

  await client.query(
    `INSERT INTO auctions
       (id, card_id, seller_user_id, status, start_price, start_time, end_time)
     VALUES ($1, $2, $3, 'ACTIVE', $4, NOW(), NOW() + INTERVAL '6 hours')`,
    [auctionId, auctionCardId, sellerId, 100],
  );

  console.log(
    JSON.stringify({
      sellerEmail: 'seller@example.com',
      bidderEmail: 'bidder@example.com',
      password: PASSWORD,
      sellerId,
      bidderId,
      auctionId,
      auctionCardId,
      bidderCardId,
    }),
  );

  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await client.end();
  } catch {
    /* ignora */
  }
  process.exit(1);
});
