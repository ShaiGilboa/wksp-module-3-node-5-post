'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const { stock, customers } = require('./data/promo');
let newUser = {};
let newOrder = {};

const items = [];

const PORT = process.env.PORT || 8000;

const handleTodo = (req, res) => {
    res.render('pages/todos', {
        title: 'todos',
        items: items
    })
}

const handleData = (req, res) => {
    const {item} = req.body;
    items.push(item);
    res.redirect('todos')
}

const checkIdentityValidity = (givenName, surname, address) => {
    let ret = false
    customers.forEach(customer => {
        if((customer.givenName === givenName) && (customer.surname === surname) || (customer.address === address)){
            ret =  true;
        }
    });
    return ret;
}

const checkOrderValidity = (order, size) => {
    if(order === 'shirt') {
        if (stock[order][size] === '0'){
            return true;
        } else {
            stock['shirt'][size] = ''+(Number(stock['shirt'][size])-1);
        };
    } else if(stock[order] === '0') {
            return true;
        } else {
            stock[order] = '' + (stock[order] - 1);
        }
    return false;
}

const checkCountryValidity = (country) => {
    if(country !== 'Canada') return true;
    return false;
}

const handleOrder = (req, res) => {
    const{ order, size, givenName, surname, email, address, city, province, postcode, country} = req.body;
    if( order === "undefined" || (order === 'shirt' && size === 'undefined')){
        res.send({'status': 'error', 'error': '000'})
    } else {
        if(checkIdentityValidity(givenName, surname, address)){
            res.send({'status': 'error', 'error': '550'})
        } else if (checkCountryValidity(country)){
            res.send({'status': 'error', 'error': '650'})
        } else if(checkOrderValidity(order,size)){
            res.send({'status': 'error', 'error': '450'})
        } else {
            newUser = {givenName,surname,email,address,city,province,postcode,country};
            customers.push(newUser);
            newOrder = {order,size};
            switch (order) {
                case 'shirt':
                newOrder.imgUrl = "/order-form/assets/tshirt.png"
                break;
                case 'bootle':
                newOrder.imgUrl = "/order-form/assets/bottle.png"
                break;
                case 'socks':
                newOrder.imgUrl = "/order-form/assets/socks.jpg"
                break;
            }
            res.send({'status': 'success'});
        }
    } 
}

const handleConfirmation = (req, res) => {
    res.render('pages/confirmation', {
        title: 'confirmation',
        user: newUser,
        order: newOrder
    })
}

express()
    .use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
	.use(morgan('tiny'))
	.use(express.static('public'))
    .use(bodyParser.json())
    .use(express.urlencoded({extended: false}))
    .set('view engine', 'ejs')

    // endpoints
        //1
    .get('/todos', handleTodo)
    .post('/data', handleData)
        //2
    .post('/order', handleOrder)
    .get('/order-confirmation', handleConfirmation)

    .get('*', (req, res) => res.send('Dang. 404.'))
    .listen(PORT, () => console.log(`Listening on port ${PORT}`));