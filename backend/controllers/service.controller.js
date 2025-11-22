const Service = require('../models/service.model');

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.getAll();
        res.status(200).send(services);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).send({ message: 'Service not found.' });
        }
        res.status(200).send(service);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Create new service (Admin only)
exports.createService = async (req, res) => {
    const { name, description, price, duration_mins } = req.body;

    try {
        const serviceId = await Service.create({
            name,
            description,
            price,
            duration_mins
        });
        res.status(201).send({ message: 'Service created successfully!', serviceId });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
    const { name, description, price, duration_mins } = req.body;

    try {
        const affectedRows = await Service.update(req.params.id, {
            name,
            description,
            price,
            duration_mins
        });

        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Service not found.' });
        }

        res.status(200).send({ message: 'Service updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
    try {
        const affectedRows = await Service.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Service not found.' });
        }
        res.status(200).send({ message: 'Service deleted successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
