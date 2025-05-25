import { Model, DataTypes } from 'sequelize';
import { ProductVariant } from './variant.model'; // assuming this is already defined
import  db  from './index'; // make sure this points to your Sequelize instance

const { sequelize } = db;
export class Product extends Model {
  public id!: string;
  public out_of_stock!: boolean;
  public default_variant_id!: string;

  // Associations
  public product_variants?: ProductVariant[];
}

Product.init(
  {
    id: {
      type: DataTypes.STRING,
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: true, // add if you're not using createdAt/updatedAt
  }
);

Product.hasMany(ProductVariant, {
  foreignKey: 'product_id',
  as: 'product_variants',
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});


