import {select, templates} from '../settings.js';
import Carousel from './Carousel.js';
class HomePage{
  constructor(element){
    const thisHomePage = this;
    thisHomePage.render(element);
    thisHomePage.initWidgets();
  }
  render(element){
    const thisHomePage = this;
    const generatedHTML = templates.homePage(thisHomePage);
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
    thisHomePage.dom.carouselWidget = thisHomePage.dom.wrapper.querySelector(select.widgets.carousel.wrapper);
  }
  initWidgets(){
    const thisHomePage = this;
    thisHomePage.carouselWidget = new Carousel(thisHomePage.dom.carouselWidget);
  }
}

export default HomePage;