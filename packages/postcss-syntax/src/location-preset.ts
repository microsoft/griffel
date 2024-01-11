import type { PluginObj, PluginPass, types as t, ConfigAPI } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { BabelPluginOptions } from '@griffel/babel-preset';

export interface LocationPluginState extends PluginPass {
  locations?: Record<string, Record<string, t.SourceLocation>>;
  resetLocations?: Record<string, t.SourceLocation>;
}

export interface LocationPluginMetadata {
  locations: Record<string, Record<string, t.SourceLocation>>;
  resetLocations: Record<string, t.SourceLocation>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocationPluginOptions extends Pick<BabelPluginOptions, 'modules'> {}

/**
 * A plugin that parses Griffel code and returns code locations mapped to respective styles and slots
 */
const plugin = declare<LocationPluginOptions, PluginObj<LocationPluginState>>((api, options) => {
  api.assertVersion(7);

  const {
    modules = [
      { moduleSource: '@griffel/react', importName: 'makeStyles', resetImportName: 'makeResetStyles' },
      { moduleSource: '@fluentui/react-components', importName: 'makeStyles', resetImportName: 'makeResetStyles' },
    ],
  } = options;

  const functionKinds = modules.map(moduleEntry => {
    return moduleEntry.importName ?? 'makeStyles';
  });

  const resetFunctionKinds = modules.map(moduleEntry => {
    return moduleEntry.resetImportName ?? 'makeResetStyles';
  });

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

        // Technically we should check if these function kinds are from Griffel
        // but since we only collect locations, the plugin is idempotent and we
        // it's safe enough to avoid doing that check
        if (functionKinds.includes(callee.node.name)) {
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

        if (resetFunctionKinds.includes(callee.node.name)) {
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

export default (babel: ConfigAPI, options: LocationPluginOptions) => {
  return {
    plugins: [[plugin, options]],
  };
};
