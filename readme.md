npx sequelize-mig migration:make --name init
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run backup

cross-env NODE_ENV=production npx sequelize db:drop
cross-env NODE_ENV=production npx sequelize db:create
cross-env NODE_ENV=production npx sequelize db:migrate
cross-env NODE_ENV=production npm run restore

npx sequelize migration:generate --name base-unit-conversion
