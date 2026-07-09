// just in case the api changes / debugging purposes
export function undefinedPropWarning(obj: any, name = 'converted_preset') : void {
    Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      console.warn(`${name} prop "${key}" is undefined`);
    }
  });
}