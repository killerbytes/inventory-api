"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    queryInterface.bulkInsert(
      "Categories",
      [
        {
          id: 1,
          name: "Building Materials",
          description:
            "Foundation materials including lumber, plywood, concrete, roofing, siding, insulation, drywall, and fencing",
          order: 1,
        },
        {
          id: 2,
          name: "Hardware",
          description:
            "Essential small parts like fasteners (nails, screws), tools accessories, door/window/cabinet hardware, chains, and electrical boxes",
          order: 2,
        },
        {
          id: 3,
          name: "Paint & Supplies",
          description:
            "Interior/exterior paint, stains, spray paint, brushes, rollers, tape, wallpaper, and painting preparation materials",
          order: 3,
        },
        {
          id: 4,
          name: "Tools",
          description:
            "Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)",
          order: 4,
        },
        {
          id: 5,
          name: "Plumbing",
          description:
            "Water systems components including pipes, fittings, water heaters, faucets, sinks, sump pumps, and toilets",
        },
        {
          id: 6,
          name: "Electrical",
          description:
            "Power and lighting systems with wiring, breakers, switches, outlets, lighting fixtures, ceiling fans, and generators",
        },
        {
          id: 7,
          name: "Flooring",
          description:
            "Surface coverings like carpet, hardwood, laminate, vinyl, tile, underlayment, and area rugs",
        },
        {
          id: 8,
          name: "Kitchen & Bath",
          description:
            "Renovation essentials including cabinets, countertops, sinks, faucets, vanities, bathtubs, showers, and toilets",
        },
        {
          id: 9,
          name: "Doors & Windows",
          description:
            "Interior/exterior doors, various window types, and garage doors for entryways and natural light",
        },
        {
          id: 10,
          name: "Garden Center",
          description:
            "Plants (trees/shrubs/flowers), soil, mulch, fertilizer, gardening tools, and pest control for landscaping",
        },
      ],
      {}
    );
    order: 1;
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    order: 1;
  },
};
