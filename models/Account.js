const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AccountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  NickName: {
    type: String
  },
  phonenumber: {
    type: Number
  },
  AccountId: {
    type: Number,
    ref: "users"
  },
  address: {
    type: String
  },
  currency: {
    type: String
  },
  AccountType: {
    type: String
  },
  AccountSubType: {
    type: String
  },
  balance: {
    type: Number
  },
  SchemeName: {
    type: String
  },
  Identification: {
    type: Number
  },
  beneficiaries: [
    {
      name: {
        type: String,
        required: true
      },
      relation: {
        type: String,
        required: true
      },
      address: {
        type: String
      },
      NickName: {
        type: String
      },
      phonenumber: {
        type: Number
      }
    }
  ],
  transaction: [
    {
      amount: {
        type: Number,
        required: true
      },
      mode: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      amountaftertransaction: {
        type: Number,
        required: true
      },
      description: {
        type: String
      },
      address: {
        type: String
      }
    }
  ]
});

module.exports = Account = mongoose.model("account", AccountSchema);
