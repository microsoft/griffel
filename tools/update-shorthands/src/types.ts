export type MdnLonghandProperty = {
  computed: string;
  status: 'standard' | 'obsolete';
};
export type MdnShorthandProperty = Pick<MdnLonghandProperty, 'status'> & {
  computed: string[];
};

export type MdnProperty = MdnLonghandProperty | MdnShorthandProperty;
export type MdnData = Record<string, MdnProperty>;

export type CSSShorthands = Record<string, [priority: number, properties: string[]]>;
