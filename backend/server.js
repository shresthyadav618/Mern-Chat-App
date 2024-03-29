
const router  = require('./routes/routes')
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGO_URL
console.log(port);
const express = require('express');
console.log(mongoUrl)
const app = express();
const Pusher = require('pusher');
const cors = require('cors');
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('/wp/',router);




const pusher = new Pusher({
    appId: "1582621",
    key: "dc320b1fae9f195b63a4",
    secret: "857240cebd66d2dc33ae",
    cluster: "ap2",
    useTLS: true
  });

const db = mongoose.connection;

db.once('open',()=>{
    console.log('db is connected');
    const collection = db.collection('messagecontents');
const changeStream  = collection.watch();

const userCollection  = db.collection('users');
const userStream  = userCollection.watch();

changeStream.on("change",(change)=>{
console.log('a change occured' );
if(change.operationType==='insert'){
    const msg = change.fullDocument;
    pusher.trigger('messages','inserted',{
        name: msg.name,
        message: msg.message,
        timestamp:msg.timestamp,
        received:msg.received,
    })
}else{
    console.log('error triggering pusher')
}
});

userStream.on('change',(change)=>{
    console.log('new user added , this is in pusher -> server js file');
    if(change.operationType==='insert'){
    const user= change.fullDocument;
    pusher.trigger('newuser','inserted',{
        name: user.name,
        email:user.email,
        password: user.password,
    })}else{
        console.log('error triggering user pusher')
    }
})

})


mongoose.connect(mongoUrl).then(()=>{
    app.listen(port, ()=>{
        console.log('listening to the requests made at the port ' , port)
    })
}).catch((err)=>{
    console.log('there is an error connection to the database' , err)
})


