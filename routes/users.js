import express, {Router} from 'express';
import passport from "passport";
import LocalStrategy from 'passport-local';
import { PrismaClient } from '@prisma/client';
import {check, validationResult} from "express-validator";
import scrypt from '../util/scrypt.js';

const router = express.Router();
const prisma = new PrismaClient();

passport.use(new LocalStrategy(
    {emailField: "email", passwordField: "password"},
    async (email, password, cb) => {
      try {
        const user = await prisma.user.findUnique({
          where: {name: email}
        });
        if (!user) {
          return cb(null, false, {message: "メールかパスワードが違います"});
        }
        const hashedPassword = scrypt.calcHash(password, user.salt);
        if (!timingSafeEqual(user.password, hashedPassword)) {
          return cb(null, false, {message: "メールかパスワードが違います"});
        }
        return cb(null, user);
      } catch (e) {
        return cb(e);
      }
    }
));

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, {id: user.id, name: user.name});
  });
});

passport.deserializeUser((user, done) => {
  process.nextTick(() => {
    return done(null, user);
  });
})



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/user/check');
});

//SignUp
router.post("/user/signup", [
    check("email").notEmpty(),
    check("password").notEmpty()
], async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      console.log(errors);
      return res.status(400).json({errors: errors});
    }
    const {userName, password, email} = req.body;
    const salt = generareSalt();
    const hashedPassword = calcHash(password, salt);

     await prisma.user.create({
       data: {
         userName,
         password: hashedPassword,
         email,
         salt
       }
     });
    return res.status(200).json({message: "success"});
  } catch (e) {
    console.log(e);
    return res.status(500).json({message: "error"});
  }
});

router.get("/user/login", (req, res, next) => {
  const data = {
    title: "User/login",
    content: "メールアドレスとパスワードを入力してください"
  }
  res.render('login', data); // ログインページのテンプレートをレンダリング
});

router.post("/login", passport.authenticate("local", {
  successReturnToOrRedirect: "/",
  failureRedirect: "/user/login",
  failureMessage: true,
  keepSessionInfo: true
}));

export default router;