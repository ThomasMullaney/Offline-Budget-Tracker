// currently not being used

const Transaction = require("../models/transaction.js");

module.exports= {
    findById: function (req, res) {
        Transaction.findById(req.params.id)
        .then((dbModel) => res.json(dbModel))
        .catch((err) => res.status(422).json(err));
    },
    removeOne: function (req, res) {
        console.log("delete route hit")
        Transaction.findById(req.params.id)
        .then((dbModel) => dbModel.remove())
        .then((dbModel) => res.json(dbModel))
        .catch((err) => res.status(422).json(err));
    },

    removeAll: function (req, res) {
        console.log("Delte all route hit")
        Transaction.deleteMany
        .then((dbModel) => dbModel.remove())
        .then((dbModel) => res.json(dbModel))
    }
};