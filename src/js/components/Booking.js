import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.selectedTable = {};
    thisBooking.starters = [];
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
    thisBooking.startersData();
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(thisBooking);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.form.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.form.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.form.querySelector(select.containerOf.starters);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.peopleAmount.addEventListener('click', function(event){
      event.preventDefault();
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function(event){
      event.preventDefault();
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){ // custom event from class BaseWidget
      thisBooking.updateDOM();
    });
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  getData(){
    const thisBooking = this;
    // eslint-disable-next-line no-unused-vars
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([ 
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){ 
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat === 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){ 
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        } 
      }
    }
    thisBooking.updateDOM(); 
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){ 
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for(let hourBlock = startHour; hourBlock < (startHour + duration); hourBlock += 0.5){ 
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){ 
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table); 
    }
  }
  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false; // will mean that this day at this time all tables are available
    if(
      typeof thisBooking.booked[thisBooking.date] === 'undefined' // there is no object created for this date
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined' // there is no array created for this date at this time
    ){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); // tableId is always a string but it can be converted into number using parseInt (below)
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      table.classList.remove(classNames.booking.selectedTable);
    }
  }
  initTables(){
    const thisBooking = this;
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      event.preventDefault();
      const clickedElement = event.target;
      if(clickedElement.hasAttribute(settings.booking.tableIdAttribute)){
        const bookedTable = clickedElement.classList.contains(classNames.booking.tableBooked);
        const selectedTable = clickedElement.classList.contains(classNames.booking.selectedTable);
        const selectedTableId = parseInt(clickedElement.getAttribute(settings.booking.tableIdAttribute));
        if(!bookedTable){
          thisBooking.selectedTable.tableId = selectedTableId;
          clickedElement.classList.add(classNames.booking.selectedTable);
          for(let table of thisBooking.dom.tables){
            if(table !== clickedElement){
              table.classList.remove(classNames.booking.selectedTable);
            }
          }
          if(selectedTable){
            clickedElement.classList.remove(classNames.booking.selectedTable);
          }
        } else if(bookedTable){
          alert('This table is unavailable, please select another one');
        }
      }
    });
  }
  startersData(){
    const thisBooking = this;
    thisBooking.dom.starters.addEventListener('click', function(event){
      const clickedElement = event.target;
      if(clickedElement.tagName === 'INPUT' && clickedElement.type === 'checkbox' && clickedElement.name === 'starter'){
        if(clickedElement.checked === true){
          thisBooking.starters.push(clickedElement.value);
        } else if(clickedElement.checked === false){
          thisBooking.starters.splice(thisBooking.starters.indexOf(clickedElement.value), 1);
        }
      }
    });
  }
  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable.tableId || null,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      // eslint-disable-next-line no-unused-vars
      .then(function(parsedResponse){
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });
  }
}
export default Booking;