'use strict';

import {
  IntegerDataType,
  Model, UUIDV4
} from 'sequelize';

interface UserAttributes {
  public_id: string;
  firstname: string;
  middlename:string;
  lastname:string;
  username: string;
  email: string;
  telephone:string;
  bankname:string;
  acc_no:number;
  password: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes> 
  implements UserAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    public_id!: string;
    firstname!: string;
    middlename!: string;
    lastname!: string;
    username!: string;
    email!: string;
    telephone!: string;
    bankname!: string;
    acc_no!:number;
    password!: string;
    
    static associate(models: any) {
      // define association here
      // User.belongsToMany(models.Project, {
      //   through: 'ProjectAssignments'
      // })
    }
  };
  User.init({
    public_id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      unique: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middlename: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
     
    telephone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bankname: {
      type: DataTypes.STRING,
      allowNull: true
    }, 
    acc_no: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

// npx sequelize-cli migration:create --name _users