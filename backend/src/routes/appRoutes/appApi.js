const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');
const { ownerAndUser } = require('@/middlewares/roleMiddleware');
const { addDataAccessFilter, addCreatedByField } = require('@/middlewares/dataAccessMiddleware');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(ownerAndUser, addCreatedByField, catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(ownerAndUser, addDataAccessFilter, catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(ownerAndUser, addDataAccessFilter, catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(ownerAndUser, addDataAccessFilter, catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(ownerAndUser, addDataAccessFilter, catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;
