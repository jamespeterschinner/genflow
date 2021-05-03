import genflow from "./index";
import { deepEqual } from "assert";

describe("range function returns array ", function () {
  it("should return [0,1,2,3,4] when called with range(5)", function () {
    deepEqual(genflow.range(5).collect(), [0, 1, 2, 3, 4]);
  });
});

describe("enumerate add index to items", function () {
  it("should return [[0,{}], [1,{}], [2,{}]] when called with cycle({}).take(3).enumerate()", function () {
    deepEqual(genflow.cycle([]).take(3).enumerate().collect(), [
      [0, undefined],
      [1, undefined],
      [2, undefined],
    ]);
  });
});

describe("range function returns array ", function () {
  it("should return [1, 4, 7] when called with range(1,9,3)", function () {
    deepEqual(genflow.range(1, 9, 3).collect(), [1, 4, 7]);
  });
});

describe("range function returns array ", function () {
  it("should return [3, 4, 5, 6, 7] when called with range(3, 8)", function () {
    deepEqual(genflow.range(3, 8).collect(), [3, 4, 5, 6, 7]);
  });
});

describe("map returns range generator with function applied to items", function () {
  it("should return [1, 2, 3, 4, 5] when called with range(5).map(i => i + 1)", function () {
    deepEqual(
      genflow
        .range(5)
        .map((i) => i + 1)
        .collect(),
      [1, 2, 3, 4, 5]
    );
    deepEqual(
      genflow.range(1, 6).collect(),
      genflow
        .range(5)
        .map((i) => i + 1)
        .collect()
    );
  });
});

describe("zip returns correct result when called with tee generators", function () {
  it("should return [(0, 0, 0), (1, 1, 1), (2, 2, 2), (3, 3, 3)] \
        when called with zip(...range(4).tee(3).collect()))", function () {
    deepEqual(
      genflow
        .zip(
          ...genflow
            .range(4)
            .tee(3)
            .map((gen) => gen.collect())
            .collect()
        )
        .collect(),
      [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3],
      ]
    );
  });
});

describe("window returns correct result", function () {
  it("should return [[0,1], [1,2], [2,3]] when called with range(4).window()", function () {
    deepEqual(genflow.range(4).window().collect(), [
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });
});

describe("accumulate defaults to running total", function () {
  it("should return [0, 1, 3, 6, 10] when called with range(5).accumulate()", function () {
    deepEqual(
      genflow
        .range(5)
        .accumulate((a, b) => a + b)
        .collect(),
      [0, 1, 3, 6, 10]
    );
  });
});

describe("Testing counts default behaviour", function () {
  it("should count from 0 by 1's by default", function () {
    deepEqual([0, 1, 2, 3, 4], genflow.count().take(5).collect());
  });
});

describe("Testing step funtion", function () {
  it("should step by the value provided", function () {
    deepEqual([0, 3, 6], genflow.count().step(3).take(3).collect());
  });
});
