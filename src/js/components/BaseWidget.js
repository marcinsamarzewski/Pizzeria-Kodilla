class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }
  get value(){ // getter of the property, here: value. Is executed whenever an atempt is made to read the property value
    const thisWidget = this;
    
    return thisWidget.correctValue; // 'getter'. Can't be 'thisWidget.value', because then get value() gets into loop: by checking 'thisWidget.value' getter starts itself. So, name of the value that has to be checked has to be diffferent than in getter
  }
  set value(value){ // 'setter'. Is executed whenever an atempt is made to set new value of the property value
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    /* add validation */
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    
    thisWidget.renderValue();
  }
  setValue(value){ // setter will be executed only if the value is correct
    const thisWidget = this;

    thisWidget.value = value;
  }
  parseValue(value){
    return parseInt(value);
  }
  isValid(value){
    return !isNaN(value);
  }
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce(){
    const thisWidget = this;

    //const event = new Event('updated');  // had to be modified to update total price after changing products number in cart
    const event = new CustomEvent('updated', {
      bubbles: true  // makes event bubble up through DOM (work on the item, its parent ... up to <body>, document, window). In custom event the bubbling needs to be turned on.
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;