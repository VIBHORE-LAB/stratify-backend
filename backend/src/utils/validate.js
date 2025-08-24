import { body, validationResult } from 'express-validator';

export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

export const authRules = {
  register: [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  login: [
    body('email').isEmail(),
    body('password').notEmpty()
  ]
};
