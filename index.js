const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
var jwt = require('jsonwebtoken');
const e = require('express');
// const cookiesParser = require('cookie-parser');
require("dotenv").config();
const stripe = require("stripe")(process.env.SERCITE_PAYMET_KEY)
const port = process.env.PORT || 5000;

//middle were data bancend get koror jonno.
app.use(cors({

    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uruvxpx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // const ServicesCollation = client.db("serviceDB").collection("service");
        const database = client.db("AdvertisementDB");
        const AdvertisementCollation = database.collection("advertisement");
        const UsersCollation = database.collection('users');
        const CardsCollation = database.collection('cards');
        const ReviewCollation = database.collection('review');
        const BoughtsCollation = database.collection('boughts');
        const PaymentCollation = database.collection('payment');

        //verifytoken------------>
        const verifyToken = (req, res, next) => {
            console.log("inside thke token of ", req.headers)
            if (!req.headers.authorization) {
                return res.status(401).send({ message: "forbidden access" })
            }
            const token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "forbidden access" })
                }
                req.decoded = decoded;
                next()
            })
            next()
        }

        //jwt token---------------->
        app.post('/jwt', async(req, res) => {
                // console.log(req.headers)
                const user = req.body;
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.send({ token })
            })
            //     //middle were----------->

        // const verifyAdmin = async(req, res, next) => {
        //     const email = req.decoded.email;
        //     const query = { email: email };
        //     const user = await UsersCollation.find(query);
        //     const isAdmin = user.role === "admin";
        //     if (!isAdmin) {
        //         return res.send({ message: "forbidden user" })
        //     }
        //     next()
        // }
        // app.get('/users/admin/:email', verifyToken, async(req, res) => {
        //     const email = req.params.email
        //     if (email !== req.decoded.email) {
        //         return res.send({ message: 'unauthoeze access' })
        //     }
        //     const query = { email: email }
        //     const user = await UsersCollation.findOne(query);
        //     let admin = false
        //     if (user) {
        //         admin = user.role === 'admin'
        //     }
        //     res.send({ admin })
        // });

        //advertisemnet section---------------->

        app.get('/advertisement', async(req, res) => {
            const cours = AdvertisementCollation.find();
            const result = await cours.toArray();
            res.send(result)
        });
        app.get('/advertisement/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) };

            const result = await AdvertisementCollation.findOne(quary);
            res.send(result)
        });
        app.get('/advertisement/agent/:email', async(req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = {
                agent_email: email
            };
            const result = await AdvertisementCollation.find(query).toArray();
            res.send(result)
        });
        app.post('/advertisement', async(req, res) => {
            const data = req.body;
            const result = await AdvertisementCollation.insertOne(data);
            res.send(result)
        });
        app.patch("/advertisement/:id", async(req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(id, body)
                // const filter = { _id: new ObjectId(id) }

            // const updatedock = {
            //     $set: {
            //         name: data.name,
            //         category: data.category,
            //         price: data.price,
            //         recipe: data.recipe,
            //         image: data.image,
            //     }
            // };
            // const result = await ServicesCollation.updateOne(filter, updatedock);
            // return res.send(result)
        });

        app.delete('/advertisement/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await AdvertisementCollation.deleteOne(quary);
            res.send(result)
        });
        //user section----------------->
        app.get('/users', async(req, res) => {
            const result = await UsersCollation.find().toArray();
            res.send(result)
        });

        app.post('/users', async(req, res) => {
            const data = req.body;
            const query = { email: data.email }
            const constexistinguser = await UsersCollation.findOne(query);
            if (constexistinguser) {
                return res.send({ message: 'user is all ready exists', insertId: null }, )
            }
            const result = await UsersCollation.insertOne(data);
            res.send(result)
        });

        // app.patch('/users/admin/:id', verifyToken, verifyAdmin, async(req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) }
        //     const updatedoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await UsersCollation.updateOne(filter, updatedoc);
        //     res.send(result)
        // });
        // app.delete('/users/:id', verifyToken, verifyAdmin, async(req, res) => {
        //     const id = req.params.id;
        //     const quary = { _id: new ObjectId(id) }
        //     const result = await UsersCollation.deleteOne(quary);
        //     res.send(result)
        // })

        //Cards section------------>

        app.get('/cards', async(req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await CardsCollation.find(query).toArray();
            res.send(result)
        });
        app.post('/cards', async(req, res) => {
            const data = req.body;
            const result = await CardsCollation.insertOne(data);
            res.send(result)
        });
        app.get('/cards/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) };
            const result = await CardsCollation.findOne(quary);
            res.send(result)
        });
        app.delete('/cards/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await CardsCollation.deleteOne(quary);
            res.send(result)
        });

        //review section------------>

        app.get('/review', async(req, res) => {
            const result = await ReviewCollation.find().toArray();
            res.send(result)
        });
        app.post('/review', async(req, res) => {
            const data = req.body;

            const result = await ReviewCollation.insertOne(data);
            res.send(result)
        });
        app.delete('/review/:id', async(req, res) => {
                const id = req.params.id;
                console.log(id)
                const quary = { _id: new ObjectId(id) }
                const result = await ReviewCollation.deleteOne(quary);
                res.send(result)
            })
            //brought secion---------->
        app.get('/boughts', async(req, res) => {
            const cours = BoughtsCollation.find();
            const result = await cours.toArray();
            res.send(result)
        });
        app.post('/boughts', async(req, res) => {
            const data = req.body;
            const result = await BoughtsCollation.insertOne(data);
            res.send(result)
        });

        //payment section-------------->
        app.post('/create-payment-intent', async(req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });
        // payment user cards info detais post sectin-- -- -- -- -- -- -- >
        app.get("/payments/:email", async(req, res) => {
            const query = { email: req.params.email }
            if (req.params.email !== req.decoded.email) {
                return res.status(403).send({ message: "fordidene access" })
            }
            const result = await PaymentCollation.find(query).toArray()
            res.send(result)
        });
        app.post("/payments", async(req, res) => {
            const payment = req.body;
            console.log(payment)
            const paymentResult = await PaymentCollation.insertOne(payment);
            const query = {
                _id: {
                    $in: payment.cartIds.map(id => new ObjectId(id))
                }
            }
            const deleteresult = await BoughtsCollation.deleteMany(query);
            res.send({ paymentResult, deleteresult })
        });
        app.get('/cards', async(req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = { email: email }
            const result = await BookingCollation.find(query).toArray();
            res.send(result)
        });



        app.post("/bistoboss", async(req, res) => {
            const data = req.body;
            console.log(data)
            const result = await ServicesCollation.insertOne(data);
            res.send(result)
        });


        app.patch("/bistoboss/:id", async(req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) }

            const updatedock = {
                $set: {
                    name: data.name,
                    category: data.category,
                    price: data.price,
                    recipe: data.recipe,
                    image: data.image,
                }
            };
            const result = await ServicesCollation.updateOne(filter, updatedock);
            return res.send(result)
        });
        app.delete('/bistoboss/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            console.log(id)
            const result = await ServicesCollation.deleteOne(quary);
            res.send(result)
        });

        app.get('/cards', async(req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await CardsCollation.find(query).toArray();
            res.send(result)
        })

        app.delete('/cards/:id', async(req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await BookingCollation.deleteOne(quary);
            res.send(result)
        });

        //----- PAYMENT METHON FUNCTION------->


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Hassaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnnnnnnnnnnnnnn')
})

app.listen(port, () => {
    console.log(`
Example app listening on port ${port}
`)
})