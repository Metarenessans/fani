export default function spy(object, onChange) {
  const handler = {
    get(target, prop, receiver) {
      // try {
      //   return new Proxy(target[property], handler);
      // } catch (err) {
      //   return Reflect.get(target, property, receiver);
      // }
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      onChange(prop, value);
    },
    defineProperty(target, property, descriptor) {
      onChange();
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      onChange();
      return Reflect.deleteProperty(target, property);
    }
  };

  return new Proxy(object, handler);
};