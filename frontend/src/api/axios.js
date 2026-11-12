// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Matches backend routes perfectly
});

export default API;