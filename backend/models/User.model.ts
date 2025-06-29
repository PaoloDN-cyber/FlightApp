import mongoose from 'mongoose';
import crypto from 'crypto';

export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    email: string,
    password: string,
    role: 'admin' | 'airline' | 'passenger';
    salt: string,    // salt è una stringa casuale che verrà mescolata con la password effettiva prima dell'hashing
    digest: string,  // questa è lìhash della password (digest della password)
    name: string,
    airlineId: mongoose.Schema.Types.ObjectId;
    setPassword: (pwd:string)=>void,
    validatePassword: (pwd:string)=>boolean,
    hasAdminRole: ()=>boolean,
    setAdmin: ()=>void,
    haSAirlineRole: ()=>boolean,
    setAirline: ()=>void,
    hasPassengerRole: ()=>boolean,
    setPassenger: ()=>void,
    }
    
const userSchema = new mongoose.Schema<User>({
    email: { 
        type: mongoose.SchemaTypes.String,
        required: true, 
        unique: true, 
    },
    password: { type: mongoose.SchemaTypes.String, required: false, },
    role: {
        type: mongoose.SchemaTypes.String,
        enum: ['admin', 'airline', 'passenger'],
        required: true,
    },
    salt:  { type: mongoose.SchemaTypes.String, required: false, },
    digest:  { type: mongoose.SchemaTypes.String, required: true, },
    
    name: { type: mongoose.SchemaTypes.String,  required: true,},

    airlineId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Airline', 
        default: null,
    },
});

// Qui aggiungiamo alcuni metodi allo schema User definiti nella interfaccia
userSchema.methods.setPassword = function( pwd:string ) {

    this.salt = crypto.randomBytes(16).toString('hex'); // Stringa esadecimale casuale di 16 byte per attributo salt

    // Utilizziamo la funzione hash sha512 per eseguire l'hash sia della password che del salt per
    // ottenere un digest della password
    // In crittografia, un HMAC (talvolta abbreviato in codice di autenticazione 
    // del messaggio a chiave hash o codice di autenticazione del messaggio basato su hash) 
    // è un tipo specifico di codice di autenticazione del messaggio (MAC) che coinvolge 
    // una funzione hash crittografica e una chiave crittografica segreta.
    
    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update( pwd );
    this.digest = hmac.digest('hex'); // il digest finale dipende sia da salt che da password
}

userSchema.methods.validatePassword = function( pwd:string ):boolean {

    // Per convalidare la password, calcoliamo il digest con lo
    // stesso HMAC per verificare se corrisponde al digest che abbiamo memorizzato
    // nel database.
    
    const hmac = crypto.createHmac('sha512', this.salt );
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return (this.digest === digest);
}

userSchema.methods.hasAdminRole = function(): boolean {
    if( this.role === 'admin' )
            return true;
    return false;
}

userSchema.methods.setAdmin = function() {
    if( !this.hasAdminRole() )
        this.role = 'admin';
}

userSchema.methods.hasAirlineRole = function(): boolean {
    if( this.role === 'airline' )
            return true;
    return false;
}

userSchema.methods.setAirline= function() {
    if( !this.hasAirlineRole() )
        this.role = 'airline';
}

userSchema.methods.hasPassengerRole = function(): boolean {
    if( this.role === 'passenger' )
            return true;
    return false;
}

userSchema.methods.setPassenger = function() {
    if( !this.hasPassengerRole() )
        this.role = 'passenger';
}

export function getSchema() { return userSchema; }

// Mongoose Model
let userModel: mongoose.Model<User>;  // Questo non è visibile all'esterno

export function getModel() : mongoose.Model< User >  { // Restitusice il modello come singleton
    if( !userModel ) {
        userModel = mongoose.model('User', getSchema() )
    }
    return userModel;
}

export function newUser(data: any): User {
    let _usermodel = getModel();
    let user = new _usermodel( data );

    return user;
}