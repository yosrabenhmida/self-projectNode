const fs = require("fs");
const http = require("http");
const url = require("url");
const path = require("path");

const overviewTemplatePath = path.join(
  __dirname,
  "template",
  "overviewTemplate.html"
);
const productTemplatePath = path.join(
  __dirname,
  "template",
  "productTemplate.html"
);
const cardTemplatePath = path.join(__dirname, "template", "cardTemplate.html");

const overviewTemplate = fs.readFileSync(overviewTemplatePath, "utf-8");
const productTemplate = fs.readFileSync(productTemplatePath, "utf-8");
const cardTemplate = fs.readFileSync(cardTemplatePath, "utf-8");

const dataPath = path.join(__dirname, "dev-data", "data.json");
const data = fs.readFileSync(dataPath, "utf-8");
const dataObj = JSON.parse(data);

// Fonction pour remplacer les placeholders dans les templates
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCT_NAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not organic");
  return output;
};

// Créer le serveur HTTP
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Route pour la page d'accueil / vue d'ensemble
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const cardHtml = dataObj
      .map((el) => replaceTemplate(cardTemplate, el))
      .join("");
    const output = overviewTemplate.replace("{%PRODUCTS%}", cardHtml);
    res.end(output);

    // Route pour une page produit spécifique
  } else if (pathname === "/product") {
    const product = dataObj[query.id];

    if (product) {
      res.writeHead(200, { "Content-Type": "text/html" });
      const output = replaceTemplate(productTemplate, product);
      res.end(output);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Product Not Found</h1>");
    }

    // Route pour les autres pages
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
