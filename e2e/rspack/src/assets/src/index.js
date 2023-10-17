// @ts-expect-error It's a fake module resolved via aliases
import { Component } from 'fake-module';

console.log(Component);
