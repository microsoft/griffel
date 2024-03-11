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

  if (values.some(value => Array.isArray(value))) {
    const styles: Styles = {} as Styles;

    for (let i = 0; i < valuesWithDefaults.length; i += 1) {
      if (valuesWithDefaults[i] || valuesWithDefaults[i] === 0) {
        const newKey = (property + positionMap[i] + suffix) as keyof Styles;

        styles[newKey] = valuesWithDefaults[i] as unknown as Styles[keyof Styles];
      }
    }

    return styles;
  }

  if (firstValue === secondValue && firstValue === thirdValue && firstValue === fourthValue) {
    return { [property + suffix]: firstValue } as unknown as Styles;
  }

  if (firstValue === thirdValue && secondValue === fourthValue) {
    return { [property + suffix]: `${firstValue} ${secondValue}` } as unknown as Styles;
  }

  if (secondValue === fourthValue) {
    return { [property + suffix]: `${firstValue} ${secondValue} ${thirdValue}` } as unknown as Styles;
  }

  return { [property + suffix]: `${firstValue} ${secondValue} ${thirdValue} ${fourthValue}` } as unknown as Styles;
}
