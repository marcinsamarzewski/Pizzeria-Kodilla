//import {select} from '../settings.js';

class Carousel{
  constructor(element){
    const thisCarousel = this;
    thisCarousel.render(element);
    thisCarousel.initPlugin();
  }
  render(element){
    const thisCarousel = this;
    thisCarousel.dom = {};
    thisCarousel.dom.wrapper = element;
  }
  initPlugin(){
    const thisCarousel = this;
    // eslint-disable-next-line no-undef, no-unused-vars
    const carousel = new Flickity(thisCarousel.dom.wrapper, {
      contain: true,
      autoPlay: 3000,
      wrapAround: true,
      prevNextButtons: false,
    });
  }
}

export default Carousel;