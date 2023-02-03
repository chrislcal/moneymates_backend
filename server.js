
const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000;

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('main page');
});

app.get('/', (req,res) => {
    res.send('')
})

app.get('/', (req, res) => {
    res.send('')
})

app.put('/', (req, res) => {
    res.send('')
})

app.delete('/', (req, res) => {
    res.send('')
})



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
