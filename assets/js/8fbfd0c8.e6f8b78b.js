"use strict";(self.webpackChunk_griffel_website=self.webpackChunk_griffel_website||[]).push([[428],{6325:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(2784),a=n(2600);const s="container_Knlc";const o=function(e){return r.createElement("div",{className:s},r.createElement(a.iC,null),r.createElement("span",null,e.children))}},3342:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>f,contentTitle:()=>c,default:()=>y,frontMatter:()=>l,metadata:()=>p,toc:()=>u});var r=n(7896),a=n(1461),s=(n(2784),n(876)),o=n(6325),i=["components"],l={sidebar_position:4},c="makeStaticStyles",p={unversionedId:"react/api/make-static-styles",id:"react/api/make-static-styles",title:"makeStaticStyles",description:"Creates styles with a global selector. This is especially useful for CSS resets, for example normalize.css.",source:"@site/docs/react/api/make-static-styles.md",sourceDirName:"react/api",slug:"/react/api/make-static-styles",permalink:"/react/api/make-static-styles",draft:!1,editUrl:"https://github.com/microsoft/griffel/tree/main/apps/website/docs/react/api/make-static-styles.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"reactSidebar",previous:{title:"shorthands",permalink:"/react/api/shorthands"},next:{title:"createDOMRenderer",permalink:"/react/api/create-dom-renderer"}},f={},u=[{value:"Defining styles with objects",id:"defining-styles-with-objects",level:2},{value:"Defining multiple styles",id:"defining-multiple-styles",level:2}],m={toc:u};function y(e){var t=e.components,n=(0,a.Z)(e,i);return(0,s.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"makestaticstyles"},"makeStaticStyles"),(0,s.kt)("p",null,"Creates styles with a global selector. This is especially useful for CSS resets, for example ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/necolas/normalize.css/"},"normalize.css"),"."),(0,s.kt)("h2",{id:"defining-styles-with-objects"},"Defining styles with objects"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-js"},"import { makeStaticStyles } from '@griffel/react';\n\nconst useStaticStyles = makeStaticStyles({\n  '@font-face': {\n    fontFamily: 'Open Sans',\n    src: `url(\"/fonts/OpenSans-Regular-webfont.woff2\") format(\"woff2\"),\n         url(\"/fonts/OpenSans-Regular-webfont.woff\") format(\"woff\")`,\n  },\n  body: {\n    backgroundColor: 'red',\n  },\n});\n\nfunction App() {\n  useStaticStyles();\n\n  return <div />;\n}\n")),(0,s.kt)(o.Z,{mdxType:"OutputTitle"},"Produces following CSS..."),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-css"},"@font-face {\n  font-family: 'Open Sans';\n  src: url('/fonts/OpenSans-Regular-webfont.woff2') format('woff2'), url('/fonts/OpenSans-Regular-webfont.woff') format('woff');\n}\nbody {\n  background-color: red;\n}\n")),(0,s.kt)("admonition",{title:"Limited support for nested selectors",type:"caution"},(0,s.kt)("p",{parentName:"admonition"},"Nested selectors are not supported for this scenario via nesting of JavaScript objects."),(0,s.kt)("pre",{parentName:"admonition"},(0,s.kt)("code",{parentName:"pre",className:"language-js"},"import { makeStaticStyles } from '@griffel/react';\n\nconst useStaticStyles = makeStaticStyles({\n  // \ud83d\udd34 Not supported\n  '.some': {\n    '.class': {\n      /* ... */\n    },\n    ':hover': {\n      /* ... */\n    },\n  },\n\n  // \u2705 Supported\n  '.some.class': {\n    /* ... */\n  },\n  '.some.class:hover': {\n    /* ... */\n  },\n});\n"))),(0,s.kt)("h2",{id:"defining-multiple-styles"},"Defining multiple styles"),(0,s.kt)("p",null,"Static styles can be defined with strings & arrays of strings/objects:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx"},"import { makeStaticStyles } from '@griffel/react';\n\nconst useStaticStyles1 = makeStaticStyles('body { background: red; } .foo { color: green; }');\nconst useStaticStyles2 = makeStaticStyles([\n  {\n    '@font-face': {\n      fontFamily: 'My Font',\n      src: `url(my_font.woff)`,\n    },\n  },\n  'html { line-height: 20px; }',\n]);\n\nfunction App() {\n  useStaticStyles1();\n  useStaticStyles2();\n\n  return <div />;\n}\n")))}y.isMDXComponent=!0},876:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(2784);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,l=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),u=c(n),m=a,y=u["".concat(l,".").concat(m)]||u[m]||f[m]||s;return n?r.createElement(y,o(o({ref:t},p),{},{components:n})):r.createElement(y,o({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,o=new Array(s);o[0]=u;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,o[1]=i;for(var c=2;c<s;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);