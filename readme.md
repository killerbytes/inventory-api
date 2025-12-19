npx sequelize-mig migration:make --name init
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run backup

npx cross-env NODE_ENV=production npm run backup
npx cross-env NODE_ENV=production npx sequelize db:drop
npx cross-env NODE_ENV=production npx sequelize db:create
npx cross-env NODE_ENV=production npx sequelize db:migrate
npx cross-env NODE_ENV=production npm run restore

npx cross-env NODE_ENV=staging npx sequelize db:drop
npx cross-env NODE_ENV=staging npx sequelize db:create
npx cross-env NODE_ENV=staging npx sequelize db:migrate
npx cross-env NODE_ENV=staging npm run restore

npx cross-env NODE_ENV=beertitos npx sequelize db:create

npx sequelize migration:generate --name fix-product-name-unique-index

psql -U postgres -h localhost -d inventory_db

ALTER TABLE "InventoryMovements" DROP CONSTRAINT "InventoryMovements_referenceId_fkey";

docker-compose up -d
