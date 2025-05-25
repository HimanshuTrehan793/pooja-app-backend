import { Model, DataTypes } from "sequelize";
import db from "./index"; // make sure this points to your Sequelize instance

const { sequelize } = db;
import { Product } from "./product.model";
import { Category } from "./category.model";

export class ProductVariant extends Model {
  public variant_id!: string;
  public product_id!: string;
  public display_label!: string;
  public name!: string;
  public description!: string;
  public mrp!: number;
  public price!: number;
  public image!: string[];
  public brand_name!: string;
  public out_of_stock!: boolean;
  public min_quantity?: number;
  public max_quantity?: number;
  public total_available_quantity!: number;

  public readonly product?: Product;
  public readonly categories?: Category[];
}

ProductVariant.init(
  {
    variant_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.STRING,
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
    modelName: "ProductVariant",
    tableName: "product_variants",
    timestamps: true,
  }
);

// ProductVariant belongsTo Product
ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ProductVariant belongsToMany Category through ProductVariantCategory
ProductVariant.belongsToMany(Category, {
  through: Category,
  foreignKey: "variant_id",
  otherKey: "category_id",
  as: "categories",
});

// Optional reverse relation (if needed)
Category.belongsToMany(ProductVariant, {
  through: Category,
  foreignKey: "category_id",
  otherKey: "variant_id",
  as: "product_variants",
});
