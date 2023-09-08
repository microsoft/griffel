import { PluginObj, PluginPass, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

export interface LocationPluginState extends PluginPass {
  locations?: Record<string, Record<string, t.SourceLocation>>;
  resetLocations?: Record<string, t.SourceLocation>;
}

export interface LocationPluginMetadata {
  locations: Record<string, Record<string, t.SourceLocation>>;
  resetLocations: Record<string, t.SourceLocation>;
}

// TODO setup module source for babel so the import source can be configured
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocationPluginOptions {}

/**
 * A plugin that parses Griffel code and returns code locations mapped to respective styles and slots
 */
const plugin = declare<LocationPluginOptions, PluginObj<LocationPluginState>>((api /** options */) => {
  api.assertVersion(7);

  return {
    name: '@griffel/slot-location-plugin',

    pre() {
      this.locations = {};
      this.resetLocations = {};
    },

    visitor: {
      Program: {
        exit() {
          Object.assign(this.file.metadata, {
            locations: this.locations,
            resetLocations: this.resetLocations,
          } as LocationPluginMetadata);
        },
      },

      CallExpression(path, state) {
        const callee = path.get('callee');
        const declarator = path.findParent(p => p.isVariableDeclarator());

        if (!declarator?.isVariableDeclarator()) {
          return;
        }

        const id = declarator.get('id');
        const declaratorId = id.isIdentifier() ? id.node.name : 'unknown';

        if (!callee.isIdentifier()) {
          return;
        }

        if (callee.node.name === 'makeStyles') {
          const locations = path.get('arguments')[0];
          if (!locations.isObjectExpression()) {
            return;
          }

          const properties = locations.get('properties');
          properties.forEach(property => {
            if (!property.isObjectProperty()) {
              return;
            }

            const key = property.get('key');
            if (!key.isIdentifier()) {
              return;
            }

            if (!property.node.loc) {
              return;
            }

            state.locations ??= {};
            state.locations[declaratorId] ??= {};
            state.locations[declaratorId][key.node.name] = {
              ...property.node.loc,
            };
            state.locations[declaratorId][key.node.name] = {
              ...property.node.loc,
            };
          });
        }

        if (callee.node.name === 'makeResetStyles') {
          state.resetLocations ??= {};
          const resetStyles = path.get('arguments')[0];
          if (!resetStyles.isObjectExpression()) {
            return;
          }

          if (!resetStyles.node.loc) {
            return;
          }

          state.resetLocations[declaratorId] = resetStyles.node.loc;
        }
      },
    },
  };
});

export default () => ({ plugins: [plugin] });
