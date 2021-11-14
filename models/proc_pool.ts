'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface Proc_PoolAttributes {

  proc__id: string;
  order__publisher: string;
  order__handler: string;
  commodity: string;
  quantity:number;
  price:number;
  timestamp:number;
  reserved_timestamp:number;
  seller_token:string;
  status:string;

}

module.exports = (sequelize: any, DataTypes: any) => {
  class Proc_Pool extends Model<Proc_PoolAttributes> 
  implements Proc_PoolAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     proc__id!: string;
     order__publisher!:string;
     order__handler!: string;
     commodity!: string;
     quantity!:number;
     price!:number;
     timestamp!:number;
     reserved_timestamp!:number;
     seller_token!:string;
     status!:string;
    
    static associate(models: any) {
      // define association here
      // Proc_Pool.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  Proc_Pool.init({
    proc__id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    order__publisher: {
        type: DataTypes.STRING,
        allowNull: false
      },
    order__handler: {
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
    }, 
    reserved_timestamp: {
        type: DataTypes.BIGINT,
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    }
    , 
    seller_token: {
        type: DataTypes.STRING(700),
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: true,
    }
    , 
    status: {
        type: DataTypes.STRING,
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Proc_Pool',
  });
  return Proc_Pool;
};

// npx sequelize-cli migration:create --name _Proc_Pools