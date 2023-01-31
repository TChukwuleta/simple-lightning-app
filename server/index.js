const express = require("express");
const expressWs = require("express-ws");
const env = require("./src/helpers/env");
const { 
    connectRpc, 
    connectorRpc,
    getInfo, 
    invoiceLookUp,
    generateInvoice
} = require('./src/node');
const cors = require("cors");
const Posts = require("./src/posts")

// Configure server
// const app = expressWs(express()).app;
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

let posts = new Posts()

// Routes 
app.get("/", async (req, res, next) => {
    try {
        const info = await getInfo();
        res.status(200).send(info)
        next();
    } catch (error) {
        next(error)
    }
});

app.get("/api/posts", (req, res) => {
    //posts.getPaidPosts()
    res.status(200).json({
        data: posts.getPaidPosts()
    })
})

app.get("/api/post/:id", (req, res) => {
    const post = posts.getPost(parseInt(req.params.id, 10));
    if(post) {
        res.status(200).json({ data: post });
    } else {
        res.status(404).json({ error: `No post found with ID ${req.params.id}`});
    }
});

app.post("/api/posts", async (req, res) => {
    const { name, content } = req.body;
    if(!name || !content) {
        res.status(400).send("Name and content fields are required to make a post");
    } 
    const post = posts.addPost(name, content);
    const invoice = await generateInvoice(post.id, content.length);

    res.status(201).json({data: {
        post,
        paymentRequest: invoice.paymentRequest
    }})
})

app.post("/api/invoicelookup", async (req, res) => {
    const { invoice } = req.body;
    if(!invoice) {
        res.status(400).send("Invoice fields are required to validate a payment");
    } 
    const validate = await invoiceLookUp(invoice);
    if (!validate.settled) {
        res.status(200).send("Invoice has not yet been settled");
    }
    const id = parseInt(validate.memo.replace('Lightning Posts post #', ''), 10);
    var post = posts.markPostAsPaid(id);

    res.status(201).json({data: {
        settled: validate.settled,
        post
    }})
})

// Initialize node and server
console.log('Initializing lightning node...');
connectorRpc().then((lnRpc) => {
    console.log("Lightning node initialized!");
    console.log('Starting server...');
    app.listen(env.PORT, () => {
        console.log(`Speak Lord, your application is listening at: http://localhost:${env.PORT}!`);
    })

    // Subscribe to all invoices, mark posts as paid
    // const stream = lnRpc.subscribeInvoices();
    // stream.on('data', chunk => {
    //     // Skip unpaid / irrelevant invoice updates
    //     if(!chunk.settled || !chunk.amtPaidSat || !chunk.memo) return;
    
    //     // Extract post id from memo, skip if we cant find an id
    //     const id = parseInt(chunk.memo.replace('Lightning Posts post #', ''), 10);
    //     if(!id) return;
    
    //     // Mark the invoice as paid!
    //     posts.markPostAsPaid(id);
    // });
});

