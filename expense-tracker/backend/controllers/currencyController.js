const Currency = require('../models/Currency');

exports.addCurrency = async (req, res) => {
    try {
        const { name, rate } = req.body;

        if (!name || !rate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const currency = new Currency({
            user: req.user.id,
            name,
            rate
        });

        await currency.save();
        res.status(200).json({ message: 'Currency added successfully', currency });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCurrencies = async (req, res) => {
    try {
        const currencies = await Currency.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(currencies);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteCurrency = async (req, res) => {
    const { id } = req.params;
    try {
        const currency = await Currency.findById(id);
        if (!currency) return res.status(404).json({ message: 'Currency not found' });

        // Check if user owns the currency
        if (currency.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Currency.findByIdAndDelete(id);
        res.status(200).json({ message: 'Currency deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateCurrency = async (req, res) => {
    const { id } = req.params;
    const { name, rate } = req.body;

    try {
        let currency = await Currency.findById(id);
        if (!currency) return res.status(404).json({ message: 'Currency not found' });

        if (currency.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        currency = await Currency.findByIdAndUpdate(
            id,
            { $set: { name, rate } },
            { new: true }
        );

        res.status(200).json({ message: 'Currency updated', currency });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
