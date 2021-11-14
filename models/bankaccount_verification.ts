'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface BankAccountVerification {

  public_id:string;
  bankname: string;
  bank_code: number;
  account_no: number;
  account_name:string;
  recipient_code:string;
  timestamp:number;

}

module.exports = (sequelize: any, DataTypes: any) => {
  class BankAccount extends Model<BankAccountVerification> 
  implements BankAccountVerification {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     public_id!:string;
     bankname!: string;
     bank_code!:number;
     account_no!: number;
     account_name!:string;
     recipient_code!:string;
     timestamp!:number;
    
    static associate(models: any) {
      // define association here
      // BankAccount.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  BankAccount.init({
    public_id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        unique: true
      },
    bankname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    bank_code: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    account_no: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }, 
    recipient_code: {
        type: DataTypes.STRING(100),
        allowNull: true
      }, 
    timestamp: {
        type: DataTypes.BIGINT,
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'BankAccount',
  });
  return BankAccount;
};

// npx sequelize-cli migration:create --name _BankAccounts