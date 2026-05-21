import axios from 'axios';

const API = axios.create({
  baseURL: 'https://food-waste-reduction-system-pvh3.onrender.com'
});

export default API;