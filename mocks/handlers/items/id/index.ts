import { Router } from 'express';
import { definitions, NullableValues } from '../../../types';
import { item4102 } from './4102_parcours-officiel_chapter';

const router = Router();

const items: Record<string, NullableValues<definitions['itemResponse']>> = {
  '4102': item4102,
};

router.get('/api/items/:itemId', (req, res, next) => {
  const item = items[req.params.itemId];
  if (!item) return next();

  res
    .operation('/items/{item_id}', 'get')
    .status(200)
    .send(item);
  next();
});

router.put('/api/items/:itemId', (req, res, next) => {
  const item = items[req.params.itemId];
  if (!item) return next();

  Object.assign(item, req.body);
  res
    .operation('/items/{item_id}', 'put')
    .status(200)
    .send({ message: 'updated', success: true });
  next();
});

router.delete('/api/items/:itemId', (req, res, next) => {
  const item = items[req.params.itemId];
  if (!item) return next();

  delete items[req.params.itemId];
  res
    .operation('/items/{item_id}', 'delete')
    .status(200)
    .send({ message: 'deleted', success: true });
  next();
});

export { router as itemIdHandler };
