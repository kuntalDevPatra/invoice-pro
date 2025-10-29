const express = require('express');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const adminController = require('@/controllers/coreControllers/adminController');
const settingController = require('@/controllers/coreControllers/settingController');
const companyController = require('@/controllers/coreControllers/companyController');

const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');
const { ownerOnly, ownerAndUser } = require('@/middlewares/roleMiddleware');
const { addDataAccessFilter, addCreatedByField } = require('@/middlewares/dataAccessMiddleware');

// //_______________________________ Admin management_______________________________

router.route('/admin/create').post(catchErrors(adminController.create));
router.route('/admin/read/:id').get(catchErrors(adminController.read));

router.route('/admin/password-update/:id').patch(catchErrors(adminController.updatePassword));
router.route('/admin/list').get(catchErrors(adminController.list));

//_______________________________ Admin Profile _______________________________

router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

// //____________________________________________ API for Global Setting (Owner Only) _________________

router.route('/setting/create').post(ownerOnly, catchErrors(settingController.create));
router.route('/setting/read/:id').get(ownerOnly, catchErrors(settingController.read));
router.route('/setting/update/:id').patch(ownerOnly, catchErrors(settingController.update));
//router.route('/setting/delete/:id).delete(ownerOnly, catchErrors(settingController.delete));
router.route('/setting/search').get(ownerOnly, catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(ownerOnly, catchErrors(settingController.filter));
router
  .route('/setting/readBySettingKey/:settingKey')
  .get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(ownerOnly, catchErrors(settingController.updateBySettingKey));
router
  .route('/setting/upload/:settingKey?')
  .patch(
    ownerOnly,
    singleStorageUpload({ entity: 'setting', fieldName: 'settingValue', fileType: 'image' }),
    catchErrors(settingController.updateBySettingKey)
  );
router.route('/setting/updateManySetting').patch(ownerOnly, catchErrors(settingController.updateManySetting));

// //____________________________________________ API for Company Management _________________

router.route('/company/create').post(ownerOnly, catchErrors(companyController.create));
router.route('/company/read/:id').get(ownerAndUser, catchErrors(companyController.read));
router.route('/company/update/:id').patch(ownerOnly, catchErrors(companyController.update));
router.route('/company/list').get(ownerAndUser, catchErrors(companyController.list));
router.route('/company/listAll').get(ownerAndUser, catchErrors(companyController.listAll));

module.exports = router;
