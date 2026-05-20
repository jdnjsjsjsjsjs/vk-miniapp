const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://ivanovskiystyle.ru";

export default API_URL;