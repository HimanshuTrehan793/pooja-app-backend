// models/productVariant.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import { Product } from "./product.model";

export class ProductVariant extends Model<
  InferAttributes<ProductVariant>,
  InferCreationAttributes<ProductVariant>
> {
  declare id: string;
  declare product_id: ForeignKey<Product["id"]>;
  declare display_label: string;
  declare name: string;
  declare description: string;
  declare mrp: number;
  declare price: number;
  declare image: string[];
  declare brand_name: string;
  declare out_of_stock: boolean;
  declare min_quantity: CreationOptional<number>;
  declare max_quantity: CreationOptional<number>;
  declare total_available_quantity: number;

  static initModel(sequelize: Sequelize) {
    ProductVariant.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        product_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        display_label: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        mrp: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        image: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        brand_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        out_of_stock: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        min_quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        max_quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        total_available_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "product_variants",
        timestamps: true,
      }
    );
  }

  static associate() {
    ProductVariant.belongsTo(Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
      as: "product",
    });
  }
}
