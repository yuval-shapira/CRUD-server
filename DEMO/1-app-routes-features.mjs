//import code libraries
import express      from 'express';
import log          from '@ajar/marker';
import bodyParser   from 'body-parser';
import morgan       from 'morgan';


//instantiating app
const app = express()

// const PORT =  process.env.PORT || 3030;
// const HOST =  process.env.HOST || 'localhost';
const { PORT = 3030, HOST = 'localhost' } = process.env;

// log.obj(process.env,'Environment variables:')

//configurating middleware

/* home-made middleware - take 1 */

const logger = (req,res,next)=> {
    log.info(`${req.method} log 1 req.url:  ${ req.url }`)
    next()
}
app.use( logger )

/* home-made middleware - take 2 */
const logger2 = prefix => (req,res,next)=>{
    log.info(`${prefix} log 2 req.url:  ${ req.url }`)
    next()
}

app.use( logger2('yo') );

app.use(  morgan('dev')  );

//configuring app middleware

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(express.json())

//define routes

app.get('/',(req,res)=>{
    res.status(200).send('Hello Express!!!');

})
// http://localhost:3030/search?food=burger&level=42&place=ashkelon
app.get('/search',(req,res)=>{
    log.magenta('query string place: ',req.query.place)
    log.magenta('query string food: ',req.query.food)
    log.magenta('query string level: ',req.query.level)
    // res.send('Hello Express!!!');
    res.status(200).json(req.query)
})


app.get('/hola',(req,res)=>{

    // res.set('Content-Type','text/html');

    let some_data = 'Inspired!';
    
    const markup = `<h1>Hello Express</h1>
                    <p>This is an example demonstrating some basic html markup<br/>
                        being sent and rendered in the browser</p>
                    <p>Prepare to be:</p>
                    <ul>
                        <li>Surprised!</li>
                        <li>Amazed!</li>
                        <li>${some_data}</li>  
                    </ul>`
    res.status(200).set('Content-Type', 'text/html').send(markup)
    // res.status(200).send(markup)
})

app.get('/api',(req,res)=>{

    const data = [
        {id:1,bot_name:'Yossi',email:'yas@gmail.com'},
        {id:2,bot_name:'Jane',email:'ja@ne.com'},
        {id:3,bot_name:'Benson',email:'ben@son.com'},
    ]

    res.status(200).json( data );
    // res.status(200).send( JSON.stringify(data) )
})

app.get('/shows/:showID/:time',(req,res)=>{
    res.status(200).send(`<h1>Up next is Show #${req.params.showID}</h1> 
                    time: ${req.params.time}`)
})

// http://localhost:3030/user/1234/edit

app.get('/user/:user_id/edit',(req,res)=>{
    res.status(200).send(`<h1>Editing user #${req.params.user_id}</h1>`)
})


app.post('/shows',(req,res)=> {
    //instead of saving the sent data to a DB, we'll just display it
    log.info(req.body.food);
    log.obj(req.body,'req.body is:');
    res.status(200).send(`Creating a new Show by the name of: ${req.body.showName}.`)
})


// app.get('*',  (req, res) => {
//     res.status(404).send('My 404 not found')
// })
// app.post('*',  (req, res) => {
//     res.status(404).send('My POST 404 not found')
// })
app.use('*',  (req, res,next) => {
    res.status(404).send(` - 404 - url was not found`)
})

// app.get('*',(req,res)=>{
//     res.sendFile('../index.html')
// })

//start the server...
app.listen(PORT, HOST,  ()=> {
    log.magenta(`🌎  listening on`,`http://${HOST}:${PORT}`);
});
