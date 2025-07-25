"use strict";

import { DataTypes, QueryInterface, Sequelize } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
    await queryInterface.removeColumn("users", "refresh_token");

    await queryInterface.createTable("user_sessions", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      browser: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "unknown",
      },
      os: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "unknown",
      },
      device_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "unknown",
      },
      device_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
    await queryInterface.dropTable("user_sessions");

    await queryInterface.addColumn("users", "refresh_token", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },
};
