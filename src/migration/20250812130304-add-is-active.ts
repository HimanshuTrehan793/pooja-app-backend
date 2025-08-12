"use strict";
import { DataTypes, QueryInterface, Sequelize } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    // Logic for adding the column
    return queryInterface.addColumn("user_devices", "is_active", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
  },

  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    // Logic for reverting the change
    return queryInterface.removeColumn("user_devices", "is_active");
  },
};
