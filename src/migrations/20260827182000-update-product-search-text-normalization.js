"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === "sqlite") return;

    await queryInterface.sequelize.query(`
      UPDATE "Products" p
      SET search_text =
        to_tsvector(
          'simple',
          regexp_replace(
            regexp_replace(
              coalesce(p.name, '') || ' ' ||
              coalesce(p.description, '') || ' ' ||
              coalesce((
                SELECT string_agg(pc.name, ' ')
                FROM "ProductCombinations" pc
                WHERE pc."productId" = p.id
                  AND pc."deletedAt" IS NULL
              ), ''),
              '[-()_/#.,]', ' ', 'g'
            ),
            '([a-zA-Z]+)\\s*([0-9]+)', '\\1 \\2 \\1\\2', 'g'
          )
        );
    `);
  },

  async down(queryInterface) {
    // No-op down migration for search_text recalculation
  },
};
