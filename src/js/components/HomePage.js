import {select, templates} from '../settings.js';
import Carousel from './Carousel.js';
//import app from '../app.js';

class HomePage{
  constructor(element){
    const thisHomePage = this;

    thisHomePage.render(element);
    thisHomePage.initWidgets();
    //thisHomePage.activatePage();
  }
  render(element){
    const thisHomePage = this;

    /* generate HTML based on template */
    const generatedHTML = templates.homePage(thisHomePage);
    //console.log(generatedHTML);

    thisHomePage.dom = {};

    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
    thisHomePage.dom.carouselWidget = thisHomePage.dom.wrapper.querySelector(select.widgets.carousel.wrapper);

    // thisHomePage.dom.order = thisHomePage.dom.wrapper.querySelector(select.home.order);
    // thisHomePage.dom.booking = thisHomePage.dom.wrapper.querySelector(select.home.booking);

  }
  initWidgets(){
    const thisHomePage = this;

    thisHomePage.carouselWidget = new Carousel(thisHomePage.dom.carouselWidget);
  }
  // activatePage(){
  //   const thisHomePage = this;

  //   thisHomePage.dom.order.addEventListener('click', function() {
  //     app.activatePage('order');
  //     window.location.hash = '#/order';
  //   });
  //   thisHomePage.dom.booking.addEventListener('click', function() {
  //     app.activatePage('booking');
  //     window.location.hash = '#/booking';
  //   });
  // }
}

export default HomePage;