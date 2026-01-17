const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Currency name is required'],
        trim: true
    },
    rate: {
        type: Number,
        required: [true, 'Exchange rate is required'],
        min: [0, 'Rate cannot be negative']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Currency', currencySchema);
