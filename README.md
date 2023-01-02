# INCI scraper
Deploy: https://inci-scraper.netlify.app/ <br/>
The application lets filter haircare products by containing (or not) particular ingredients (INCI nomenclature is valid). It allows a quick analysis of product compositions, simplifies selection according to preference, and the consideration of ingredients that cause allergies. Data are from Rossmann website.  Ingredient information was read by the scraping function - [*check the code*](https://github.com/a-szczepan/webscraper-server/tree/master/scraper) - (it is not run automatically so as not to disrupt the service).

**Stack:** 
 - [Frontend](https://github.com/a-szczepan/web-scraper-client):
		  <br/>- HTML + CSS
		  <br/>- JavaScript
		  <br/>- React.js
		  <br/>- MaterialUI
		  <br/>- RWD
 - Backend:
		<br /> - *server*: Node.js + Express.js
		<br /> - *db*: MongoDB + Mongoose ODM
 - Scraper:
<br/>- JavaScript
<br/>- Puppeteer
