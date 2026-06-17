require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({
  sub: '6a32b1fad36c5b34cfb87d09',
  email: 'agrawalsumit067@gmail.com',
  role: 'user'
}, process.env.JWT_SECRET || '54c6fd5f928676c0eb250922d6154ef57b3191a8db5792d08c57f606611d0d55');

console.log("TOKEN=" + token);
