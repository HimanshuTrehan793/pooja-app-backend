// models/product.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";
import { ProductVariant } from "./productVariant.model";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<string>;
  declare out_of_stock: boolean;
  declare default_variant_id: string;

  static initModel(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        out_of_stock: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        default_variant_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "products",
        timestamps: true,
      }
    );
  }

  static associate() {
    Product.hasMany(ProductVariant, {
      foreignKey: "product_id",
      as: "product_variants",
      onDelete: "CASCADE",
    });
  }
}
