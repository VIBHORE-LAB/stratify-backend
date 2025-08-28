import db from "../models/index.js";
import { hashPassword } from "../utils/hash.js";
import {signJwt} from '../config/jwt.js';

const {User} = db;

export const register = async(req, res) =>{
    try{
    const {email, password, name} = req.body;
    const exists = await User.findOne({where: {email}});
    if(exists){
        return res.status(409).json({message:"Email already in use"});
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({email, passwordHash, name});
    const token = signJwt({sub: user.id})
    res.json({token, user:{id: user.id, email: user.email, name: user.name}});


    }

    catch(e){
        console.error(e);
    }
}


export const login = async(req,res) =>{
    const user = req.user;
    const token = signJwt({sub: user.id});
    console.log("token", token);
    res.json({token, user:{id:user.id, email: user.email, name: user.name}});
}

