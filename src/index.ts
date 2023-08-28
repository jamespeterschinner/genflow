type Operator<T> = (a: T, b: T) => T;

function* _identity<T>(arraylikeOrIterable: Iterable<T>) {
  for (const item of arraylikeOrIterable) {
    yield item;
  }
}

function* _filter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

function* _filterMap<T, R>(
  iterable: Iterable<T>,
  predicate: (item: T) => R | null | undefined
) {
  for (const item of iterable) {
    const result = predicate(item);
    if (result !== null && result !== undefined) {
      yield result;
    }
  }
}

function* _flatten<T>(iterable: Iterable<Iterable<T> | T>): Generator<T> {
  for (const it of iterable) {
    try {
      for (const item of it as Iterable<T>) {
        yield item;
      }
    } catch {
      yield it as T;
    }
  }
}

function* _map<T, R>(iterable: Iterable<T>, func: (item: T) => R) {
  for (const item of iterable) {
    yield func(item);
  }
}

function* _zip<T>(...args: Iterable<T>[]) {
  const generators = args.map(_identity);
  while (true) {
    const result = generators.map((it) => it.next().value);
    if (result.every((item) => item !== undefined)) {
      yield result;
    } else {
      break;
    }
  }
}

function* _tee<T>(iterable: Iterable<T>, splits: number = 2) {
  let indexes = Array(splits).fill(0);
  const acc: T[] = [];
  const bufferIterator = (upto: number) => {
    let bufferFull = false;
    if (acc.length - 1 < upto) {
      const { value, done } = iterable[Symbol.iterator]().next();
      bufferFull = Boolean(done);
      if (value !== undefined) {
        acc.push(value);
      }
    }

    if (Math.min(...indexes) !== 0) {
      acc.shift();
      indexes = indexes.map((idx) => idx - 1);
    }
    return bufferFull;
  };
  for (const idxIndex of _range(splits)) {
    yield (function* () {
      while (true) {
        if (bufferIterator(indexes[idxIndex])) {
          return;
        }
        yield acc[indexes[idxIndex]];
        indexes[idxIndex] += 1;
      }
    })();
  }
}

function* _drop<T>(iterable: Iterable<T>, items: number = 1) {
  const generator = _identity(iterable);
  for (const _ of _range(items)) {
    generator.next();
  }
  return generator;
}

function* _step<T>(iterable: Iterable<T>, step: number = 1) {
  let count = 0;
  for (const item of iterable) {
    if (count === 0) {
      yield item;
    }
    count += 1;
    if (count >= step) {
      count = 0;
    }
  }
}

function* _slice<T>(
  iterable: Iterable<T>,
  start: number = 0,
  stop: number | null = null,
  step: number = 1
) {
  let gen: Iterable<T>;
  if (start === 0) {
    gen = iterable;
  } else {
    gen = _drop(iterable, start);
  }
  if (step > 0) {
    gen = _step(gen, step);
  }
  if (stop !== null) {
    gen = _take(gen, Math.floor((stop - start) / step));
  }
  return gen;
}

function* _window<T>(iterable: Iterable<T>, n: number = 2) {
  let window = [];
  const iterator = iterable[Symbol.iterator]();

  for (const _ of Array.from({ length: n })) {
    const { done, value } = iterator.next();
    window.push(value);
    if (done) {
      return; // Exiting the generator if the iterable is exhausted
    }
  }

  yield [...window];

  while (true) {
    const { done, value } = iterator.next();
    if (done) {
      break; // Exit the loop when the iterable is exhausted
    }

    window.shift();
    window.push(value);
    yield [...window]; // Yield a shallow copy of the window
  }
}

function* _count(start: number = 0, step: number = 1) {
  let n = start;
  while (true) {
    yield n;
    n += step;
  }
}

function* _range(start: number = 0, stop?: number, step: number = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  let value = start;
  while (value < stop) {
    yield value;
    value += step;
  }
}

function* _cycle<T>(objectOrIterable: Iterable<T>, times: number = -1) {
  let count = 0;
  let previousItems: T[] = [];

  for (const item of objectOrIterable) {
    previousItems.push(item);
    yield item;
  }
  count += 1;

  while (count < times || times === -1) {
    if (previousItems.length > 0) {
      for (const item of previousItems) {
        yield item;
      }
    } else {
      yield undefined;
    }
    count = times > 0 ? count + 1 : 1;
  }
}

function* _accumulate<T>(
  iterable: Iterable<T>,
  operator: Operator<T>,
  initial: T | undefined = undefined
) {
  const iterator = iterable[Symbol.iterator]();

  const { value: first } = iterator.next();

  let acc: T = initial !== undefined ? operator(initial, first) : first;

  yield acc;

  let item = iterator.next();

  while (!item.done) {
    acc = operator(item.value, acc);
    yield acc;
    item = iterator.next();
  }

  return acc;
}

function* _enumerate<T>(iterable: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (const item of iterable) {
    yield [index, item];
    index += 1;
  }
}

function* _take<T>(iterable: Iterable<T>, number: number) {
  let count = 0;
  for (const item of iterable) {
    if (count === number) {
      break;
    } else {
      yield item;
      count++;
    }
  }
}

function* _takeWhile<T>(
  predicate: (item: T) => boolean,
  iterable: Iterable<T>
) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    } else {
      return;
    }
  }
}

class Genflow<T> implements IterableIterator<T> {
  constructor(private generator: IterableIterator<T>) {}

  [Symbol.iterator]() {
    return this.generator;
  }

  next() {
    return this.generator.next();
  }

  collect() {
    return Array.from(this);
  }

  takeWhile(predicate: (item: T) => boolean) {
    return new Genflow(_takeWhile(predicate, this));
  }

  enumerate() {
    return new Genflow(_enumerate(this));
  }

  take(number: number) {
    return new Genflow(_take(this, number));
  }

  cycle(times: number = -1) {
    return new Genflow(_cycle(this, times));
  }

  accumulate(operator: Operator<T>, initial: T | undefined = undefined) {
    return new Genflow(_accumulate(this, operator, initial));
  }

  tee(splits: number = 2) {
    return new Genflow(_map(_tee(this, splits), (gen) => new Genflow(gen)));
  }

  drop(items: number = 1) {
    return new Genflow(_drop(this, items));
  }

  step(step: number = 1) {
    return new Genflow(_step(this, step));
  }

  slice(start: number = 0, stop: number | null = null, step: number = 1) {
    return new Genflow(_slice(this, start, stop, step));
  }

  map<R>(func: (item: T) => R) {
    return new Genflow(_map(this, func));
  }

  window(n: number = 2) {
    return new Genflow(_window(this, n));
  }

  flatten() {
    return new Genflow(_flatten(this));
  }

  filter(predicate: (item: T) => boolean = (item) => Boolean(item)) {
    return new Genflow(_filter(this, predicate));
  }

  filterMap<R>(predicate: (item: T) => R | null | undefined) {
    return new Genflow(_filterMap(this, predicate));
  }
}

export interface GenflowFunctions {
  count(start?: number, step?: number): Genflow<number>;
  range(start?: number, stop?: number, step?: number): Genflow<number>;
  accumulate<T>(
    iterable: Iterable<T>,
    operator: Operator<T>,
    initial?: T | undefined
  ): Genflow<T>;
  enumerate<T>(iterable: Iterable<T>): Genflow<[number, T]>;
  take<T>(iterable: Iterable<T>, number: number): Genflow<T>;
  cycle<T>(iterable: Iterable<T>, times?: number): Genflow<T | undefined>;
  tee<T>(iterable: Iterable<T>, splits?: number): Genflow<Genflow<T>>;
  drop<T>(iterable: Iterable<T>, items?: number): Genflow<T>;
  step<T>(iterable: Iterable<T>, step?: number): Genflow<T>;
  slice<T>(
    iterable: Iterable<T>,
    start?: number,
    stop?: number | null,
    step?: number
  ): Genflow<T>;
  zip<T>(...iterables: Iterable<T>[]): Genflow<(void | T)[]>;
  map<T, R>(iterable: Iterable<T>, func: (item: T) => R): Genflow<R>;
  window<T>(
    iterable: Iterable<T>,
    n?: number
  ): Genflow<(void | Generator<never, Iterable<T>, unknown>)[]>;
  flatten<T>(iterable: Iterable<T>): Genflow<T>;
  filter<T>(
    iterable: Iterable<T>,
    predicate?: (item: T) => boolean
  ): Genflow<T>;
  filterMap<T, R>(
    iterable: Iterable<T>,
    predicate: (item: T) => R | null | undefined
  ): Genflow<R>;
}

const genflow: GenflowFunctions = {
  count(start = 0, step = 1) {
    return new Genflow(_count(start, step));
  },
  range(start = 0, stop, step = 1) {
    return new Genflow(_range(start, stop, step));
  },
  accumulate(iterable, operator, initial = undefined) {
    return new Genflow(_accumulate(iterable, operator, initial));
  },
  enumerate(iterable) {
    return new Genflow(_enumerate(iterable));
  },
  take(iterable, number) {
    return new Genflow(_take(iterable, number));
  },
  cycle(iterable, times = -1) {
    return new Genflow(_cycle(iterable, times));
  },
  tee(iterable, splits = 2) {
    return new Genflow(_map(_tee(iterable, splits), (gen) => new Genflow(gen)));
  },
  drop(iterable, items = 1) {
    return new Genflow(_drop(iterable, items));
  },
  step(iterable, step = 1) {
    return new Genflow(_step(iterable, step));
  },
  slice(iterable, start = 0, stop = undefined, step = 1) {
    return new Genflow(_slice(iterable, start, stop, step));
  },
  zip(...iterables) {
    return new Genflow(_zip(...iterables));
  },
  map(iterable, func) {
    return new Genflow(_map(iterable, func));
  },
  window(iterable, n = 2) {
    return new Genflow(_window(iterable, n));
  },
  flatten(iterable) {
    return new Genflow(_flatten(iterable));
  },
  filter(iterable, predicate = (item) => Boolean(item)) {
    return new Genflow(_filter(iterable, predicate));
  },
  filterMap(iterable, predicate) {
    return new Genflow(_filterMap(iterable, predicate));
  },
};

export default genflow;
