"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "search_text", {
      type: Sequelize.TSVECTOR,
      allowNull: false,
      defaultValue: Sequelize.literal("''::tsvector"),
    });

    await queryInterface.sequelize.query(`
      UPDATE "Products" p
      SET search_text =
        to_tsvector(
          'simple',
          coalesce(p.description, '') || ' ' ||
          coalesce((
            SELECT string_agg(pc.name, ' ')
            FROM "ProductCombinations" pc
            WHERE pc."productId" = p.id
          ), '')
        );
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_products_search_text ON "Products" USING GIN (search_text);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_products_search_text;`
    );

    await queryInterface.removeColumn("Products", "search_text");
  },
};
