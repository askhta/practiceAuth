const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const Tree = require('./models/tree');
const path = require('path');

const app = express();

mongoose.connect('mongodb://localhost:27017/tree-shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('Cannot connect to MongoDB', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.get('/', async (req, res) => {
    const trees = await Tree.find();
    res.render('index', { trees: trees });
});

app.post('/add-tree', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    let image = '';

    if (req.file) {
        const fs = require('fs');
        const imageData = fs.readFileSync(req.file.path);
        image = imageData.toString('base64');

        fs.unlinkSync(req.file.path);
    }

    const newTree = new Tree({ name, description, image });
    await newTree.save();
    res.redirect('/');
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
