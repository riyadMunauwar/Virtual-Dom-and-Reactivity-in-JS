let data = {price: 10, quantity: 3};
let target = null, total, salePrice;

class Dep {
  constructor(){
    this.subscribers = [];
  }
  
  depend() {
    if(target && !this.subscribers.includes(target)) this.subscribers.push(target);
  }
  
  notify(){
    this.subscribers.forEach(sub => sub());
  }
}

Object.keys(data).forEach(key => {
  let internalValue = data[key];
  
  let dep = new Dep();
  
  Object.defineProperty(data, key, {
    get () {
        dep.depend();
        return internalValue;
    },
    
    set (value) {
      internalValue = value;
      dep.notify();
    }
  })
    
})


let watcher = (fn) => {
  target = fn;
  target();
  target = null;
}

watcher(() => {
  total = data.price * data.quantity;
})

watcher(() => {
  salePrice = data.price * .8;
})
data.price = 15;
data.price = 20;
console.log(total);
console.log(salePrice);
