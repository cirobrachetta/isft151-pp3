PRAGMA foreign_keys = ON;

------------------------------------------------------------
-- 1) STOCK por movimientos (única fuente de verdad)
------------------------------------------------------------

-- Evitar vender por encima del stock disponible
CREATE TRIGGER IF NOT EXISTS sm_before_ins_check_stock
BEFORE INSERT ON stock_movements
FOR EACH ROW
WHEN NEW.type = 'venta'
BEGIN
  SELECT
    CASE
      WHEN (SELECT stock FROM products WHERE id = NEW.product_id) < NEW.qty
      THEN RAISE(ABORT, 'Stock insuficiente para venta')
    END;
END;

-- Aplicar impacto al snapshot de stock (INSERT)
CREATE TRIGGER IF NOT EXISTS sm_after_ins_apply_stock
AFTER INSERT ON stock_movements
FOR EACH ROW
BEGIN
  UPDATE products
  SET stock = stock + CASE NEW.type
                        WHEN 'compra'  THEN NEW.qty
                        WHEN 'ajuste+' THEN NEW.qty
                        WHEN 'ajuste-' THEN -NEW.qty
                        WHEN 'venta'   THEN -NEW.qty
                      END
  WHERE id = NEW.product_id;
END;

-- Revertir impacto al snapshot de stock (DELETE)
CREATE TRIGGER IF NOT EXISTS sm_after_del_apply_stock
AFTER DELETE ON stock_movements
FOR EACH ROW
BEGIN
  UPDATE products
  SET stock = stock - CASE OLD.type
                        WHEN 'compra'  THEN OLD.qty
                        WHEN 'ajuste+' THEN OLD.qty
                        WHEN 'ajuste-' THEN -OLD.qty
                        WHEN 'venta'   THEN -OLD.qty
                      END
  WHERE id = OLD.product_id;
END;

-- Recalcular impacto al snapshot de stock (UPDATE)
CREATE TRIGGER IF NOT EXISTS sm_after_upd_apply_stock
AFTER UPDATE OF type, qty ON stock_movements
FOR EACH ROW
BEGIN
  -- quitar efecto anterior
  UPDATE products
  SET stock = stock - CASE OLD.type
                        WHEN 'compra'  THEN OLD.qty
                        WHEN 'ajuste+' THEN OLD.qty
                        WHEN 'ajuste-' THEN -OLD.qty
                        WHEN 'venta'   THEN -OLD.qty
                      END
  WHERE id = OLD.product_id;

  -- validar nueva venta
  SELECT
    CASE
      WHEN NEW.type = 'venta'
       AND (SELECT stock FROM products WHERE id = NEW.product_id) < NEW.qty
      THEN RAISE(ABORT, 'Stock insuficiente para venta (update)')
    END;

  -- aplicar nuevo efecto
  UPDATE products
  SET stock = stock + CASE NEW.type
                        WHEN 'compra'  THEN NEW.qty
                        WHEN 'ajuste+' THEN NEW.qty
                        WHEN 'ajuste-' THEN -NEW.qty
                        WHEN 'venta'   THEN -NEW.qty
                      END
  WHERE id = NEW.product_id;
END;

------------------------------------------------------------
-- 2) Vincular ventas de productos -> stock_movements
--    Se usa note = 'sale:<sale_id>:<product_id>' como correlación
------------------------------------------------------------

-- INSERT de ítem de venta -> crear movimiento 'venta'
CREATE TRIGGER IF NOT EXISTS psi_after_ins_create_sm
AFTER INSERT ON product_sale_items
FOR EACH ROW
BEGIN
  INSERT INTO stock_movements(product_id, type, qty, unit_cost, note, event_id, user_id)
  VALUES (
    NEW.product_id,
    'venta',
    NEW.qty,
    NULL,
    'sale:' || NEW.sale_id || ':' || NEW.product_id,
    (SELECT event_id FROM product_sales WHERE id = NEW.sale_id),
    (SELECT user_id  FROM product_sales WHERE id = NEW.sale_id)
  );
END;

-- UPDATE de qty o product_id -> reemplazar movimiento correlacionado
CREATE TRIGGER IF NOT EXISTS psi_after_upd_sync_sm
AFTER UPDATE OF qty, product_id ON product_sale_items
FOR EACH ROW
BEGIN
  DELETE FROM stock_movements
   WHERE note = 'sale:' || OLD.sale_id || ':' || OLD.product_id;

  INSERT INTO stock_movements(product_id, type, qty, unit_cost, note, event_id, user_id)
  VALUES (
    NEW.product_id,
    'venta',
    NEW.qty,
    NULL,
    'sale:' || NEW.sale_id || ':' || NEW.product_id,
    (SELECT event_id FROM product_sales WHERE id = NEW.sale_id),
    (SELECT user_id  FROM product_sales WHERE id = NEW.sale_id)
  );
END;

-- DELETE de ítem de venta -> borrar movimiento correlacionado
CREATE TRIGGER IF NOT EXISTS psi_after_del_remove_sm
AFTER DELETE ON product_sale_items
FOR EACH ROW
BEGIN
  DELETE FROM stock_movements
   WHERE note = 'sale:' || OLD.sale_id || ':' || OLD.product_id;
END;

------------------------------------------------------------
-- 3) Payments -> actualizar deuda acumulada y estado
------------------------------------------------------------

-- Validar no exceder el total
CREATE TRIGGER IF NOT EXISTS pay_before_ins_cap_total
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN (SELECT COALESCE(amount_paid,0) FROM debts WHERE id = NEW.debt_id)
         + NEW.amount
         > (SELECT amount_total FROM debts WHERE id = NEW.debt_id)
    THEN RAISE(ABORT, 'Pago excede el total de la deuda')
  END;
END;

-- INSERT: sumar pago y actualizar estado
CREATE TRIGGER IF NOT EXISTS pay_after_ins_update_debt
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  UPDATE debts
  SET amount_paid = amount_paid + NEW.amount,
      status = CASE
                 WHEN amount_paid + NEW.amount >= amount_total THEN 'saldada'
                 ELSE status
               END
  WHERE id = NEW.debt_id;
END;

-- DELETE: restar pago y recalcular estado
CREATE TRIGGER IF NOT EXISTS pay_after_del_update_debt
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
  UPDATE debts
  SET amount_paid = amount_paid - OLD.amount,
      status = CASE
                 WHEN amount_paid - OLD.amount >= amount_total THEN 'saldada'
                 ELSE 'pendiente'
               END
  WHERE id = OLD.debt_id;
END;

-- UPDATE: ajustar diferencia
CREATE TRIGGER IF NOT EXISTS pay_after_upd_update_debt
AFTER UPDATE OF amount, debt_id ON payments
FOR EACH ROW
BEGIN
  -- revertir en deuda vieja
  UPDATE debts
  SET amount_paid = amount_paid - OLD.amount,
      status = CASE
                 WHEN amount_paid - OLD.amount >= amount_total THEN 'saldada'
                 ELSE 'pendiente'
               END
  WHERE id = OLD.debt_id;

  -- aplicar en deuda nueva
  UPDATE debts
  SET amount_paid = amount_paid + NEW.amount,
      status = CASE
                 WHEN amount_paid + NEW.amount >= amount_total THEN 'saldada'
                 ELSE status
               END
  WHERE id = NEW.debt_id;
END;

------------------------------------------------------------
-- 4) Audit básico (sin user_id de sesión)
--    Deja rastro mínimo; user_id queda NULL.
------------------------------------------------------------

CREATE TRIGGER IF NOT EXISTS products_audit_ins
AFTER INSERT ON products
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(user_id, action, entity, entity_id)
  VALUES (NULL, 'INSERT', 'products', NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS products_audit_upd
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(user_id, action, entity, entity_id)
  VALUES (NULL, 'UPDATE', 'products', NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS products_audit_del
AFTER DELETE ON products
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(user_id, action, entity, entity_id)
  VALUES (NULL, 'DELETE', 'products', OLD.id);
END;