// importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher  from 'pusher'
import cors  from 'cors'
// app config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: '1076916',
    key: '92c0b5193583534f7fcd',
    secret: 'a8c8b2547510a90313d9',
    cluster: 'us2',
    encrypted: true
  })

// middleware
app.use(express.json()) 
/* app.use(cors())  */
/* for deploy config reemplaze whith cors */
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*"),
    res.setHeader("Access-Control-Allow-Headers","*"),
    next();
})

// DB config
const connection_url='mongodb+srv://admin:admin@cluster0.11ibs.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db=mongoose.connection

db.once('open',() => {
    console.log('DB connected')

    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log('A change ocurred',change);

        if(change.operationType === 'insert'){
            const messagDetails = change.fullDocument;
            pusher.trigger('messages','inserted',
                {
                    name:messagDetails.name,
                    message:messagDetails.message,
                    timestamp:messagDetails.timestamp,
                    received:messagDetails.received,
                }
            );
        } else{
            console.log('Error triggering Pusher')
        }
    });
});



// api routes
app.get('/',(req,res)=>res.status(200).send("hello world"))

app.get("/messages/new",(req,res)=>{
    Messages.find((err,data)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

app.post("/messages/new",(req,res)=> {
    //POST request is to ADD DATA to the database
    //it will let us ADD a video Document to the videos COLLECTION
    const dbMessage=req.body;

    Messages.create(dbMessage,(err,data)=>{
        if (err) {
            console.log("error 500");
            res.status(500).send(err);
        } else {
            console.log("201 ok enviado");
            res.status(201).send(data);
        }
    });
});

app.use((req,res) => {
    res.send("404")
});

// listen
app.listen(port,()=>console.log('Listen on localhost:'+port))