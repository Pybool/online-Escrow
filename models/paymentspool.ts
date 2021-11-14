'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface PaymentPoolAttributes {

 
  payment_ref:string;
  order_id: string;
  order_publisher: string;
  amount:number;
  timestamp:number;

}

module.exports = (sequelize: any, DataTypes: any) => {
  class PaymentPool extends Model<PaymentPoolAttributes> 
  implements PaymentPoolAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     payment_ref!:string;
     order_id!: string;
     order_publisher!: string;
     amount!:number;
     timestamp!:number;
    
    static associate(models: any) {
      // define association here
      // PaymentPool.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  PaymentPool.init({
    payment_ref: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      order_publisher: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
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
    modelName: 'PaymentPool',
  });
  return PaymentPool;
};

// npx sequelize-cli migration:create --name _PaymentPools