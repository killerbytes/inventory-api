npx sequelize-mig migration:make --name init
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run backup

cross-env NODE_ENV=production npm run backup
cross-env NODE_ENV=production npx sequelize db:drop
cross-env NODE_ENV=production npx sequelize db:create
cross-env NODE_ENV=production npx sequelize db:migrate
cross-env NODE_ENV=production npm run restore

cross-env NODE_ENV=staging npx sequelize db:drop
cross-env NODE_ENV=staging npx sequelize db:create
cross-env NODE_ENV=staging npx sequelize db:migrate
cross-env NODE_ENV=staging npm run restore

npx sequelize migration:generate --name fix-product-name-unique-index

psql -U postgres -h localhost -d inventory_db

ALTER TABLE "InventoryMovements" DROP CONSTRAINT "InventoryMovements_referenceId_fkey";

docker-compose up -d
