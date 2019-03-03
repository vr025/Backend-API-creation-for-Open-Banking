const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/account");
const validateTransactionInput = require("../../validation/transaction");
const validateBeneficiaryInput = require("../../validation/beneficiary");

// Load Profile Model
const Profile = require("../../models/Account");
// Load User Model
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Publicnpm
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// @route   GET api/account
// @desc    Get current users account
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no account for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/:accountId
// @desc    Get profile by accountId
// @access  Public

router.get(
  "/:accountId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ AccountId: req.params.accountId })
      .populate("user", ["name"])
      .then(profile => {
        if (!profile) {
          errors.noaccount = "There is no account for this user";
          res.status(404).json(errors);
        }
        if (!req.user.openBank) var sample = profile;
        else
          var sample = {
            name: req.user.name,
            balance: profile.balance,
            AccountId: profile.AccountId,
            AccountType: profile.AccountType,
            SchemeName: profile.SchemeName,
            Identification: profile.Identification
          };

        res.json(sample);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/:accountId/transaction
// @desc    Get profile by accountId
// @access  Public

router.get(
  "/:accountId/transaction",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ AccountId: req.params.accountId })
      .populate("user", ["name"])
      .then(profile => {
        if (!profile) {
          errors.noaccount = "There is no account for this user";
          res.status(404).json(errors);
        }

        if (!req.user.openBank) var sample = profile.transaction;
        else {
          var sample = profile.transaction.map(value => {
            if (new Date().getTime() - value.date.getTime() < 31658965900)
              return {
                amount: value.amount,
                date: value.date
              };
          });

          sample = sample.filter(value => value != null);
        }
        res.json(sample);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/:accountId/beneficiaries
// @desc    Get profile by accountId
// @access  Public

router.get(
  "/:accountId/beneficiaries",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ AccountId: req.params.accountId })
      .then(profile => {
        if (!profile) {
          errors.noaccount = "There is no account for this user";
          res.status(404).json(errors);
        }
        if (!req.user.openBank) var sample = profile.beneficiaries;
        else
          var sample = profile.beneficiaries.map(value => {
            return {
              name: value.name,
              relation: value.relation
            };
          });

        res.json(sample);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/:accountId/balance
// @desc    Get profile by accountId
// @access  Public

router.get(
  "/:accountId/balance",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ AccountId: req.params.accountId })
      .then(profile => {
        if (!profile) {
          errors.noaccount = "There is no account for this user";
          res.status(404).json(errors);
        }

        res.json({ balance: profile.balance });
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   POST api/account
// @desc    Create or edit user account
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Get fields
    const AccountFields = {};
    AccountFields.user = req.user.id;
    //if (req.body.handle) AccountFields.handle = req.body.handle;
    if (req.body.phonenumber) AccountFields.phonenumber = req.body.phonenumber;
    if (req.body.address) AccountFields.address = req.body.address;
    if (req.body.currency) AccountFields.currency = req.body.currency;
    if (req.body.AccountType) AccountFields.AccountType = req.body.AccountType;
    if (req.body.balance) AccountFields.balance = req.body.balance;
    if (req.body.NickName) AccountFields.NickName = req.body.NickName;
    if (req.body.SchemeName) AccountFields.SchemeName = req.body.SchemeName;
    if (req.body.Identification)
      AccountFields.Identification = req.body.Identification;

    User.findOne({ _id: req.user.id }).then(user => {
      if (user) {
        AccountFields.AccountId = user.AccountId;
      }
      console.log(AccountFields.AccountId);
    });

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: AccountFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        new Profile(AccountFields).save().then(profile => res.json(profile));
      }
    });
  }
);

// @route   POST api/account/transaction
// @desc    Add experience to profile
// @access  Private
router.post(
  "/transaction",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTransactionInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (req.body.mode === "credit")
        profile.balance = Number(profile.balance) + Number(req.body.amount);
      if (req.body.mode === "debit")
        profile.balance = Number(profile.balance) - Number(req.body.amount);

      const newExp = {
        amount: req.body.amount,
        mode: req.body.mode,
        date: req.body.date,
        description: req.body.description,
        amountaftertransaction: profile.balance,
        address: req.body.address
      };

      // Add to exp array
      profile.transaction.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/beneficiaries
// @desc    Add beneficiaries to profile
// @access  Private
router.post(
  "/beneficiaries",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateBeneficiaryInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        name: req.body.name,
        relation: req.body.relation,
        phonenumber: req.body.phonenumber,
        NickName: req.body.NickName,
        address: req.body.address
      };

      // Add to exp array
      profile.beneficiaries.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/beneficiaries/:ben_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.beneficiaries
          .map(item => item.id)
          .indexOf(req.params.ben_id);

        // Splice out of array
        profile.beneficiaries.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/transaction/:tran_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.transaction
          .map(item => item.id)
          .indexOf(req.params.tran_id);

        // Splice out of array
        profile.transaction.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
