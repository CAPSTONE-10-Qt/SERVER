import { Router, NextFunction } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import auth from '../middleware/auth';
import errorValidator from '../middleware/error/errorValidator';
import { env } from 'process';
import axios from 'axios';
import app from '..';

const router: Router = Router();

router.get('/myPage', errorValidator, auth, userController.accessUserInfo);

router.get(
  "/", 
  [
    body('id'),
    body('name'),
    body('avata_url')
  ], 
  errorValidator, 
  userController.createUser,
)

export default router;

function next(): NextFunction {
  throw new Error('Function not implemented.');
}
