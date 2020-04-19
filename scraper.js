const puppeteer = require('puppeteer');
const axios = require('axios');

async function getDepartureId(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.goto(url);

  const textContent = await page.evaluate(() => {
    return document.querySelector('#originalContinuationId').innerHTML;
  });
  return textContent
}

async function fetchExpediaData(departureId) {
  const baseUrl = `https://www.expedia.com/Flight-Search-Paging?c=${departureId}&is=1&sp=asc&cz=200&cn=0&ul=0`
  return await axios.get(baseUrl).then((res) => {
    return dataFormatter(res.data);
  })
}

function dataFormatter(data) {
  return Object.keys(data.content.legs).map((legId) => {
    const leg = data.content.legs[legId];
    const { price, carrierSummary, departureLocation, arrivalLocation } = leg;
    const formattedPrice = price ? price.formattedPrice : 'N/A';
    const airlineName = carrierSummary ? carrierSummary.airlineName : 'N/A';
    const deptAirportCode = departureLocation ? departureLocation.airportCode : 'N/A';
    const arrivalAirportCode = arrivalLocation ? arrivalLocation.airportCode : 'N/A';
    return `${airlineName} ${deptAirportCode} -> ${arrivalAirportCode} | ${formattedPrice}`
  })
}

async function getRawFlightOfferData(deptAirportCode, arrivalAirportCode, startDate, endDate) {
  const url = 'https://www.expedia.com/Flights-Search?trip=roundtrip'
  + `&leg1=from:${deptAirportCode},to:${arrivalAirportCode},departure:${startDate}TANYT`
  + `&leg2=from:${arrivalAirportCode},to:${deptAirportCode},departure:${endDate}TANYT`
  + `&passengers=adults:1,children:0,seniors:0,infantinlap:Y&options=cabinclass`
  + `%3Aeconomy&mode=search&origref=www.expedia.com`;

  console.log(url);
  const departureId = await getDepartureId(url);
  const rawData = await fetchExpediaData(departureId);
  console.log(rawData)
  return rawData;
}

// getRawFlightOfferData('SFO', 'LAX', '05/18/20', '05/26/20');
getRawFlightOfferData('SFO', 'LAX', '05/18/20', '05/26/20')