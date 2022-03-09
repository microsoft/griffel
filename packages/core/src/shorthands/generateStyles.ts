import type { GriffelStylesCSSValue, ValueOrArray, GriffelStyle } from '@griffel/style-types';

type DirectionalProperties = 'border' | 'padding' | 'margin';

const positionMap = ['Top', 'Right', 'Bottom', 'Left'];

export function generateStyles<Styles extends GriffelStyle>(
  property: DirectionalProperties,
  suffix: '' | 'Color' | 'Style' | 'Width',
  ...values: ValueOrArray<GriffelStylesCSSValue>[]
): Styles {
  const [firstValue, secondValue = firstValue, thirdValue = firstValue, fourthValue = secondValue] = values;
  const valuesWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];

  const styles: Styles = {} as Styles;

  for (let i = 0; i < valuesWithDefaults.length; i += 1) {
    if (valuesWithDefaults[i] || valuesWithDefaults[i] === 0) {
      const newKey = (property + positionMap[i] + suffix) as keyof Styles;

      styles[newKey] = valuesWithDefaults[i] as unknown as Styles[keyof Styles];
    }
  }

  return styles;
}
