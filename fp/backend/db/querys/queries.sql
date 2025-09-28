
-- stock minimo
SELECT id, name, stock, min_stock
FROM products
WHERE stock <= min_stock;

-- entradas vendidas en evento
SELECT e.id, e.name, SUM(ts.qty) AS entradas, SUM(ts.qty*ts.unit_price) AS ingresos
FROM events e
LEFT JOIN ticket_sales ts ON ts.event_id = e.id
GROUP BY e.id;

-- presupuesto consolidado
SELECT
  e.id, e.name,
  IFNULL( (SELECT SUM(amount) FROM cash_movements WHERE event_id=e.id AND type='ingreso'), 0)
  + IFNULL( (SELECT SUM(qty*unit_price) FROM ticket_sales WHERE event_id=e.id), 0)
  + IFNULL( (SELECT SUM(psi.qty*psi.unit_price) 
             FROM product_sales ps JOIN product_sale_items psi ON psi.sale_id=ps.id
             WHERE ps.event_id=e.id), 0) AS ingresos,
  IFNULL( (SELECT SUM(amount) FROM cash_movements WHERE event_id=e.id AND type='egreso'), 0) AS egresos;

-- 