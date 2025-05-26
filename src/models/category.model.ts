// import { Model, DataTypes } from "sequelize";
// import db from "./index"; // make sure this points to your Sequelize instance

// const { sequelize } = db;
// export class Category extends Model {
//   public id!: string;
//   public name!: string;
//   public image!: string;
//   public parent_id!: string | null;

//   public readonly parent?: Category;
//   public readonly children?: Category[];
// }

// Category.init(
//   {
//     id: {
//       type: DataTypes.STRING,
//       primaryKey: true,
//       allowNull: false,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     image: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     parent_id: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "Category",
//     tableName: "categories",
//     timestamps: true,
//   }
// );
// // A Category belongs to its parent
// Category.belongsTo(Category, {
//   foreignKey: "parent_id",
//   as: "parent",
// });

// // A Category can have many child categories
// Category.hasMany(Category, {
//   foreignKey: "parent_id",
//   as: "children",
// });
