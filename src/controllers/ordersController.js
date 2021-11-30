/* eslint-disable no-await-in-loop */
const pool = require('../db/pool');

module.exports = {
  async index(_req, res) {
    try {
      const orders = await pool.query('SELECT * FROM orders ORDER BY id DESC');

      res.json(orders.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async show(req, res) {
    const orderId = req.params.id;

    try {
      const order = await pool.query(
        'SELECT client_name, client_email, client_cpf, client_phone, date FROM orders WHERE id = $1',
        [orderId]
      );

      const orderedItems = await pool.query(
        'SELECT product_name, product_value, product_quantity FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id WHERE o.id = $1',
        [orderId]
      );

      if (!order.rows.length) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ ...order.rows[0], orderItems: orderedItems.rows });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async create(req, res) {
    const { clientName, clientEmail, clientCpf, clientPhone, orderItems } =
      req.body;

    if (!orderItems.length) {
      return res.status(404).json({ error: 'Must order at least one item' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // insertOrder
      const insertOrder = await client.query(
        'INSERT INTO orders (client_name, client_email, client_cpf, client_phone) VALUES ($1, $2, $3, $4) RETURNING id',
        [clientName, clientEmail, clientCpf, clientPhone]
      );

      // verifyProductAndQuantity
      // eslint-disable-next-line no-restricted-syntax
      for (const element of orderItems) {
        if (element.product_quantity <= 0) {
          res.status(400).json({
            error: `Product #${element.product_id} quantity must be greater than 0`,
          });
          await client.query('ROLLBACK');
          return;
        }

        const productActualQuantity = await client.query(
          'SELECT quantity FROM products WHERE id = $1',
          [element.product_id]
        );

        if (!productActualQuantity.rows.length) {
          res
            .status(404)
            .json({ error: `Product #${element.product_id} does not exist` });
          return;
        }

        if (productActualQuantity.rows[0].quantity < element.product_quantity) {
          if (productActualQuantity.rows[0].quantity === 0) {
            res.status(400).json({
              error: `Product #${element.product_id} is out of stock`,
            });
            await client.query('ROLLBACK');
            return;
          }
          res.status(400).json({
            error: `Product #${element.product_id} quantity (${element.product_quantity}) must be less than or equal to ${productActualQuantity.rows[0].quantity}`,
          });
          await client.query('ROLLBACK');
          return;
        }

        // insertOrderItems
        await client.query(
          'INSERT INTO order_items (product_name, product_value, product_quantity, order_id) VALUES ($1, $2, $3, $4)',
          [
            element.product_name,
            element.product_value,
            element.product_quantity,
            insertOrder.rows[0].id,
          ]
        );

        // decreaseProductQuantity
        await client.query('UPDATE products SET quantity = $1 WHERE id = $2', [
          productActualQuantity.rows[0].quantity - element.product_quantity,
          element.product_id,
        ]);
      }

      await client.query('COMMIT');

      res.status(201).send();
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },
};
