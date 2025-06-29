import dotenv from 'dotenv';

// The dotenv module will load a file named ".env" file and load all the key-value pairs into process.env 
// (environment variable)

const result = dotenv.config()     
                                            
if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}

import * as user from '../models/User.model.js';
import * as airline from '../models/Airline.model.js';
import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import passport from 'passport';           // authentication middleware for Express

import jsonwebtoken from 'jsonwebtoken';  // JWT generation

import { Strategy as LocalStrategy, IVerifyOptions  } from 'passport-local';
import { AppError, BadRequestError } from '../utils/errors.js';

export interface AuthenticatedUser   {
  id: string; role: string; mail: string; name:string; status: string; airlineId: Types.ObjectId; 
}

export interface Payload extends Request {
  user: AuthenticatedUser;
  body: {oldPassword: string, newPassword: string};
}

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const u = await user.getModel().findOne({ email });
      if (!u || !u.validatePassword(password)) {
        // PASSAPorto-Local si aspetta che l'oggetto info abbia al massimo { message?: string }
        return done(null, false, { message: 'Credenziali non valide' });
      }
      return done(null, u);
    } catch (err) {
      return done(err);
    }
  }
));


// Registrazione utente con ruolo passenger

export async function registerPassenger(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password} = req.body;
    
    if (!password) {
      return next({ statusCode: 400, error: true, errormessage: "Password field missing" });
    }

    // Verifica se l'email esiste già come utente
    const existingUser = await user.getModel().findOne({ email });
    if (existingUser) {
          return next(new BadRequestError('Email già in uso'));
    }
   
    let u = user.newUser({
         name: name,
         email : email,
         role: 'passenger'
    });

		u.setPassword(password); // metti crypto
    const saved = await u.save(); // await sulla Promise restituita da save()
    return res.status(201).json({
      error: false,
      errormessage: "",
      id: saved._id
    });

  } catch (err) {
    if (err.code === 11000) {
      return next({ statusCode: 409, error: true, errormessage: "User already exists" });
    }
    return next({ 
      statusCode: 500, 
      error: true, 
      errormessage: "DB error: "+ err.errmsg  
    });
  }
}

// Procede al login con il passport indicato qui localmente 
// inserendo nel token : id, email, name, role e se airilineId valido anche status

export async function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('local', { session: false },
    async (err, u, info: { message?: string; statusCode?: number }) => {
      try {
        if (err) throw err;
        if (!u) {
          // qui usa info.message e info.statusCode, ma non info.type
          throw new AppError(info?.message || 'Login failed', info?.statusCode || 401);
        }

      const tokenPayload: any = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      };

      // Se è una compagnia aerea, includi l'ID della compagnia
      if (u.role === 'airline' && u.airlineId) {

      tokenPayload.airlineId = u.airlineId;
      const a = await airline.getModel().findById(u.airlineId);
      tokenPayload.status = a?.status || null;
      }

      const token = jsonwebtoken.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      return res.json({ token });
      }catch (err) {
        next(err);
      }
    }
  )(req, res, next);
}

// Funzione che permette ad una compagnia di cambiare la passord temporanea e passare ad uno status definitive

export async function changePassword (req: Payload, res: Response, next: NextFunction){
  try {
    const { oldPassword, newPassword } = req.body;
    
    const userId = req.user.id;
  
    if (!req.body.newPassword) {
      return res.status(400).json({ error: "Password obbligatoria" });
    }

    const u = await user.getModel().findById(userId);
    if (!u || !u.validatePassword(oldPassword)) {
      return res.status(401).json({ error: 'Password vecchia errata o utente non trovato' });
    }


    const a = await airline.getModel().findById(u.airlineId);
    if (u.role === 'airline' && a && a.status !== 'definitive') {
      a.status = 'definitive';
      await a.save();
    }

    u.setPassword(newPassword);
    await u.save();

    res.json({ message: 'Password aggiornata' });
  } catch (err) {
    next(err);
  }
}