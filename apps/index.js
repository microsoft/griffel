const generateMedia = (bucketCount, ruleCount) => {
  return Object.fromEntries(
    new Array(bucketCount)
      .fill(0)
      .map((_, i) => {
        const mediaQuery = `@media screen and (max-width: ${i}px)`;
        const rules = new Array(ruleCount).fill(0).map((_, j) => {
          return [
            [`root${i}-${j}`],
            {
              [mediaQuery]: {
                paddingLeft: `${j}px`,
              },
            },
          ];
        });
        return rules;
      })
      .flat(),
  );
};

console.dir(generateMedia(3, 3), { depth: 10 });
