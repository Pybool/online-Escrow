'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface OrderPoolAttributes {

  order_id: string;
  order_publisher: string;
  commodity: string;
  quantity:number;
  price:number;
  timestamp:number;

}

module.exports = (sequelize: any, DataTypes: any) => {
  class OrderPool extends Model<OrderPoolAttributes> 
  implements OrderPoolAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     order_id!: string;
     order_publisher!:string;
     commodity!: string;
     quantity!:number;
     price!:number;
     timestamp!:number;
    
    static associate(models: any) {
      // define association here
      // OrderPool.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  OrderPool.init({
    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    order_publisher: {
        type: DataTypes.STRING,
        allowNull: false
      },
    commodity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.BIGINT,
      allowNull: false
    }, 
    price: {
      type: DataTypes.BIGINT,
      allowNull: false
    }, 
    timestamp: {
        type: DataTypes.BIGINT,
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'OrderPool',
  });
  return OrderPool;
};

// npx sequelize-cli migration:create --name _OrderPools