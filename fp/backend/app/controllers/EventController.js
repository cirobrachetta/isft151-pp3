const EventDAO = require('../dao/EventDAO');
const OrganizationDAO = require('../dao/OrganizationDAO');

const EventController = {
  list(_req, res) {
    try {
      const events = EventDAO.selectAll();
      res.json(events);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getById(req, res) {
    try {
      const event = EventDAO.selectById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: 'Not found' });
      res.json(event);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create(req, res) {
    try {
      const { name, date, ticketPrice, organizationId } = req.body;
      const userId = req.userId;

      if (!name || !date) throw new Error('Missing required fields');

      let orgId = organizationId;
      if (!orgId) {
        const row = OrganizationDAO.getOrgByUser(userId);
        orgId = row?.organization_id || null;
      }

      const info = EventDAO.insert({ name, date, ticketPrice, organizationId: orgId });
      res.status(201).json({ message: 'Created', id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  update(req, res) {
    try {
      const id = Number(req.params.id);
      const prev = EventDAO.selectById(id);
      if (!prev) throw new Error('Event not found');

      const {
        name = prev.name,
        date = prev.date,
        ticketPrice = prev.ticket_price,
        active = prev.active
      } = req.body;

      EventDAO.update(id, { name, date, ticketPrice, active });
      res.json({ message: 'Updated' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  remove(req, res) {
    try {
      const id = Number(req.params.id);
      const event = EventDAO.selectById(id);
      if (!event) throw new Error('Event not found');
      EventDAO.deactivate(id);
      res.json({ message: 'Event deactivated' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  // Métodos de productos del evento

   listProducts(req, res) {
    try {
      const eventId = Number(req.params.id);
      const rows = EventDAO.selectProductsByEvent(eventId);
      res.json(rows);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  assignProduct(req, res) {
    try {
      const eventId = Number(req.params.id);
      const { productId, qty } = req.body;
      EventDAO.assignProductToEvent(eventId, productId, qty);
      res.json({ message: "Producto asignado correctamente" });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  updateAssignedProduct(req, res) {
    try {
      const { eventId, productId } = req.params;
      const { qty } = req.body;
      EventDAO.updateAssignedProduct(Number(eventId), Number(productId), qty);
      res.json({ message: 'Asignación actualizada' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  removeAssignedProduct(req, res) {
    try {
      const { eventId, productId } = req.params;
      EventDAO.removeAssignedProduct(Number(eventId), Number(productId));
      res.json({ message: 'Asignación eliminada' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
};

module.exports = { EventController };