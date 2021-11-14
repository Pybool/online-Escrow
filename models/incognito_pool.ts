'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface IncognitoPoolAttributes {

  proc__id: string;
  order__publisher: string;
  order__handler: string;
  price:number;
  timestamp:number;
  reserved_timestamp:number;

}

module.exports = (sequelize: any, DataTypes: any) => {
  class IncognitoPool extends Model<IncognitoPoolAttributes> 
  implements IncognitoPoolAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     proc__id!: string;
     order__publisher!:string;
     order__handler!: string;
     price!:number;
     timestamp!:number;
     reserved_timestamp!:number;
    
    static associate(models: any) {
      // define association here
      // IncognitoPool.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  IncognitoPool.init({
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
  }, {
    sequelize,
    modelName: 'IncognitoPool',
  });
  return IncognitoPool;
};

// npx sequelize-cli migration:create --name _IncognitoPools