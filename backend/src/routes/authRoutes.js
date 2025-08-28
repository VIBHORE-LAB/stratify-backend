import {Router} from 'express';
import passport from 'passport';
import {register, login} from '../controllers/authController.js';
import {validate, authRules} from '../utils/validate.js';
const router = Router();


router.post('/register', validate(authRules.register), register);
router.post('/login', validate(authRules.login), passport.authenticate('local', { session: false }), login);



export default router;