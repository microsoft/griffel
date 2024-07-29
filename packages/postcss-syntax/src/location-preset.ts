import type { PluginObj, PluginPass, types as t, ConfigAPI } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { BabelPluginOptions } from '@griffel/babel-preset';

export type CommentDirective = [/** directive */ string, /** value */ string];
export type CommentDirectivesBySlot = Record</** slot */ string, CommentDirective[]>;
export type CommentDirectivesByHookDeclarator = Record</** hook declarator */ string, CommentDirectivesBySlot>;

export type LocationsBySlot = Record</** slot */ string, t.SourceLocation>;
export type LocationsByHookDeclarator = Record</** hook declarator */ string, LocationsBySlot>;

export type ResetCommentDirectivesByHookDeclarator = Record</** hook declarator */ string, CommentDirective[]>;

export type ResetLocationsByHookDeclarator = Record</** hook declarator */ string, t.SourceLocation>;

export interface LocationPluginState extends PluginPass {
  locations?: LocationsByHookDeclarator;
  commentDirectives?: CommentDirectivesByHookDeclarator;

  resetCommentDirectives?: ResetCommentDirectivesByHookDeclarator;
  resetLocations?: ResetLocationsByHookDeclarator;
}

export interface LocationPluginMetadata {
  locations: Record<string, Record<string, t.SourceLocation>>;
  commentDirectives: CommentDirectivesByHookDeclarator;

  resetCommentDirectives: ResetCommentDirectivesByHookDeclarator;
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
      this.commentDirectives = {};
      this.resetCommentDirectives = {};
    },

    visitor: {
      Program: {
        exit() {
          Object.assign(this.file.metadata, {
            locations: this.locations,
            resetLocations: this.resetLocations,
            commentDirectives: this.commentDirectives,
            resetCommentDirectives: this.resetCommentDirectives,
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

            const commentDirectives = parseCommentDirectives(property.node.leadingComments);
            if (commentDirectives) {
              state.commentDirectives ??= {};
              state.commentDirectives[declaratorId] ??= {};
              state.commentDirectives[declaratorId][key.node.name] = commentDirectives;
            }
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

          // For reset styles we only care about the comment directives on the variable declaration
          // The leading commment can either be attached to a variable declaration of an export declaration (i.e. export const useResetStyles = ...)
          const parentDeclaration =
            path.findParent(p => p.isExportNamedDeclaration()) ?? path.findParent(p => p.isVariableDeclaration());
          if (parentDeclaration) {
            const commentDirectives = parseCommentDirectives(parentDeclaration.node.leadingComments);
            if (commentDirectives) {
              state.resetCommentDirectives ??= {};
              state.resetCommentDirectives[declaratorId] = commentDirectives;
            }
          }
        }
      },
    },
  };
});

function parseCommentDirectives(leadingComments: t.Comment[] | null | undefined): CommentDirective[] | null {
  if (!leadingComments) {
    return null;
  }

  const entries = leadingComments
    // We don't support comment blocks
    .filter(comment => comment.type === 'CommentLine')
    .map(comment => {
      const commentValue = comment.value.trim();
      if (!commentValue.startsWith('griffel-')) {
        return;
      }

      const tokens = commentValue.split(' ');
      return [tokens[0], tokens[1]];
    })
    .filter(Boolean) as [string, string][];

  return entries;
}

export default (babel: ConfigAPI, options: LocationPluginOptions) => {
  return {
    plugins: [[plugin, options]],
  };
};
