const pool = require('../db/pool');

module.exports = {
  async index(_req, res) {
    try {
      const products = await pool.query(
        'SELECT * FROM products ORDER BY id DESC'
      );

      res.json(products.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async show(req, res) {
    const productId = req.params.id;

    try {
      const product = await pool.query(
        'SELECT name, value, quantity, provider, receipt_date FROM products WHERE id = $1',
        [productId]
      );

      if (!product.rows.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async create(req, res) {
    const { name, value, quantity, provider } = req.body;

    try {
      await pool.query(
        'INSERT INTO products (name, value, quantity, provider) VALUES ($1, $2, $3, $4)',
        [name, value, quantity, provider]
      );

      res.status(201).send();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async update(req, res) {
    const productId = req.params.id;
    const { name, value, quantity, provider } = req.body;

    try {
      const productCount = await pool.query(
        'SELECT COUNT(*) FROM products WHERE id = $1',
        [productId]
      );

      if (productCount.rows[0].count === '0') {
        return res.status(404).json({ error: 'Product not found' });
      }

      await pool.query(
        'UPDATE products SET name = $1, value = $2, quantity = $3, provider = $4 WHERE id = $5',
        [name, value, quantity, provider, productId]
      );

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async delete(req, res) {
    const productId = req.params.id;

    try {
      const productCount = await pool.query(
        'SELECT COUNT(*) FROM products WHERE id = $1',
        [productId]
      );

      if (productCount.rows[0].count === '0') {
        return res.status(404).json({ error: 'Product not found' });
      }

      await pool.query('DELETE FROM products WHERE id = $1', [productId]);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },
};
