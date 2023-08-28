# Genflow - Utility Library for generators

Inspired by python itertools, Genflow provides a collection of utility functions for chaining generator functions. It offers a wide range of operations, allowing you to process and manipulate data in various ways.

## Installation

To use Genflow in your project, you can install it via npm:

```bash
npm install genflow
```

## Usage

Import the `genflow` module code:

```ts
import genflow from "genflow";
```

Here are some examples of how to use genflow:

### Example 1: Creating an Iterable of Numbers

```ts
// Generates an iterable of numbers from 1 to 9
const numbers = genflow.range(1, 10);

for (const num of numbers) {
  console.log(num);
}
```

### Example 2: Applying Filtering and Mapping

```ts
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const filteredAndMapped = genflow
  // Filters even numbers
  .filter(data, (num) => num % 2 === 0)
  // Doubles the filtered numbers
  .map((num) => num * 2);

// Outputs: 4, 8, 12, 16, 20
for (const num of filteredAndMapped) {
  console.log(num);
}
```

### Example 3: Creating a Sliding Window

```ts
const text = ["This", "is", "a", "sample", "text", "for", "window", "example"];
const windowSize = 3;
const slidingWindow = genflow.window(text, windowSize);

// Outputs arrays of 3 adjacent words
for (const window of slidingWindow) {
  console.log(window);
}
```

For a complete list of available functions and their usage, refer to the [API Documentation](#api-documentation) section.

## API Documentation

Genflow provides a collection of utility functions and a wrapper class for iterables. Here's a list of available functions:

- `count(start?: number, step?: number): Wrapper<number>`
- `range(start?: number, stop?: number, step?: number): Wrapper<number>`
- `accumulate<T>(iterable: Iterable<T>, operator: Operator<T>, initial?: T | undefined): Wrapper<T>`
- `enumerate<T>(iterable: Iterable<T>): Wrapper<[number, T]>`
- `take<T>(iterable: Iterable<T>, number: number): Wrapper<T>`
- `cycle<T>(iterable: Iterable<T>, times?: number): Wrapper<T | undefined>`
- `tee<T>(iterable: Iterable<T>, splits?: number): Wrapper<Wrapper<T>>`
- `drop<T>(iterable: Iterable<T>, items?: number): Wrapper<T>`
- `step<T>(iterable: Iterable<T>, step?: number): Wrapper<T>`
- `slice<T>(iterable: Iterable<T>, start?: number, stop?: number | null, step?: number): Wrapper<T>`
- `zip<T>(...iterables: Iterable<T>[]): Wrapper<(void | T)[]>`
- `map<T, R>(iterable: Iterable<T>, func: (item: T) => R): Wrapper<R>`
- `window<T>(iterable: Iterable<T>, n?: number): Wrapper<(void | Generator<never, Iterable<T>, unknown>)[]>`
- `flatten<T>(iterable: Iterable<T>): Wrapper<T>`
- `filter<T>(iterable: Iterable<T>, predicate?: (item: T) => boolean): Wrapper<T>`
- `filterMap<T, R>(iterable: Iterable<T>, predicate: (item: T) => R | null | undefined): Wrapper<R>`

## Contributing

If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/your/repository).

## License

Genflow is released under the [MIT License](https://opensource.org/licenses/MIT).

---

This module was developed by [James Schinner](https://github.com/your/profile). If you find it helpful, consider giving it a star on GitHub!
