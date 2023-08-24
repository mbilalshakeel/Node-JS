const config = require('config');
const express = require('express');
const Joi = require('joi');
const logger = require('./logger');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(logger);
app.use(helmet());


// Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
console.log('Mail Password: ' + config.get('mail.password'));

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log('Morgan enabled...');
}


const courses = [
    {id: 1, name: 'course1'},   
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'}
];


app.get('/api/courses', (req, res) => {
    res.send(courses);    
}); 

app.get('/api/courses/:id',(req, res) =>{
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) res.status(404).send('The course with the given ID was not found'); 
    res.send(course);
});

app.post('/api/courses', (req, res) => {   
    const schema = Joi.object({  
        name: Joi.string().min(3).required()    
    });
    const result = schema.validate(req.body);      

    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }
    const course = {
        id:courses.length+1,
        name:req.body.name
    };
    courses.push(course);
    res.send(course);

});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) res.status(404).send('The course with the given ID was not found');

    const { error } = validateCourse(req.body); //result.error          
    if(error){      
        res.status(400).send(error.details[0].message);
        return;
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('App listening on port 3000!');
});

app.delete('/api/courses/:id', (req, res) => {  
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) res.status(404).send('The course with the given ID was not found');

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});


function validateCourse(course){    
    const schema = Joi.object({  
        name: Joi.string().min(3).required()    
    });
    return schema.validate(course);
}



