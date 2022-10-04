"use strict";(self.webpackChunk_griffel_website=self.webpackChunk_griffel_website||[]).push([[780],{5098:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>g,frontMatter:()=>o,metadata:()=>d,toc:()=>c});var r=n(7896),a=n(1461),s=(n(2784),n(876)),i=(n(465),["components"]),o={sidebar_position:4},l="Server-Side Rendering",d={unversionedId:"react/guides/ssr-usage",id:"react/guides/ssr-usage",title:"Server-Side Rendering",description:"Griffel provides first class support for Server-Side Rendering.",source:"@site/docs/react/guides/ssr-usage.md",sourceDirName:"react/guides",slug:"/react/guides/ssr-usage",permalink:"/react/guides/ssr-usage",draft:!1,editUrl:"https://github.com/microsoft/griffel/tree/main/apps/website/docs/react/guides/ssr-usage.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"reactSidebar",previous:{title:"Limitations",permalink:"/react/guides/limitations"},next:{title:"Child Window",permalink:"/react/guides/child-window-rendering"}},p={},c=[{value:"Next.js",id:"nextjs",level:2},{value:"Base setup",id:"base-setup",level:3},{value:"Configuring a project",id:"configuring-a-project",level:3}],u={toc:c};function g(e){var t=e.components,n=(0,a.Z)(e,i);return(0,s.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"server-side-rendering"},"Server-Side Rendering"),(0,s.kt)("p",null,"Griffel provides first class support for Server-Side Rendering."),(0,s.kt)("h2",{id:"nextjs"},"Next.js"),(0,s.kt)("h3",{id:"base-setup"},"Base setup"),(0,s.kt)("p",null,"For basic instructions to setup Next.js, see ",(0,s.kt)("a",{parentName:"p",href:"https://nextjs.org/docs/getting-started"},"Getting Started"),". Please complete the following steps:"),(0,s.kt)("ol",null,(0,s.kt)("li",{parentName:"ol"},"Get a basic Next.js setup running, rendering a page from the ",(0,s.kt)("inlineCode",{parentName:"li"},"pages")," folder, as guided by the tutorial."),(0,s.kt)("li",{parentName:"ol"},"Add the Griffel to dependencies (",(0,s.kt)("inlineCode",{parentName:"li"},"@griffel/react")," package), check ",(0,s.kt)("a",{parentName:"li",href:"/react/install"},"Install")," page.")),(0,s.kt)("p",null,"A complete demo project is available on ",(0,s.kt)("a",{parentName:"p",href:"https://codesandbox.io/s/next-js-project-with-griffel-react-f22mwn"},"CodeSandbox"),"."),(0,s.kt)("h3",{id:"configuring-a-project"},"Configuring a project"),(0,s.kt)("ol",null,(0,s.kt)("li",{parentName:"ol"},"Create a ",(0,s.kt)("inlineCode",{parentName:"li"},"_document.js")," file under your ",(0,s.kt)("inlineCode",{parentName:"li"},"pages")," folder with the following content:")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx"},"// highlight-next-line\nimport { createDOMRenderer, renderToStyleElements } from '@griffel/react';\nimport Document, { Html, Head, Main, NextScript } from 'next/document';\n\nclass MyDocument extends Document {\n  static async getInitialProps(ctx) {\n    // highlight-start\n    // \ud83d\udc47 creates a renderer\n    const renderer = createDOMRenderer();\n    const originalRenderPage = ctx.renderPage;\n\n    ctx.renderPage = () =>\n      originalRenderPage({\n        enhanceApp: App => props => <App {...props} renderer={renderer} />,\n      });\n    // highlight-end\n\n    const initialProps = await Document.getInitialProps(ctx);\n    // highlight-start\n    const styles = renderToStyleElements(renderer);\n\n    return {\n      ...initialProps,\n      // \ud83d\udc47 adding our styles elements to output\n      styles: [...initialProps.styles, ...styles],\n    };\n    // highlight-end\n  }\n\n  render() {\n    return (\n      <Html>\n        <Head />\n        <body>\n          <Main />\n          <NextScript />\n        </body>\n      </Html>\n    );\n  }\n}\n\nexport default MyDocument;\n")),(0,s.kt)("ol",{start:2},(0,s.kt)("li",{parentName:"ol"},"Create or modify an ",(0,s.kt)("inlineCode",{parentName:"li"},"_app.js")," file under your ",(0,s.kt)("inlineCode",{parentName:"li"},"pages")," folder with the following content:")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-js"},"import { createDOMRenderer, RendererProvider } from '@griffel/react';\n\nfunction MyApp({ Component, pageProps, renderer }) {\n  return (\n    // \ud83d\udc47 accepts a renderer passed from the <Document /> component or creates a default one\n    <RendererProvider renderer={renderer || createDOMRenderer()}>\n      <Component {...pageProps} />\n    </RendererProvider>\n  );\n}\n\nexport default MyApp;\n")),(0,s.kt)("ol",{start:3},(0,s.kt)("li",{parentName:"ol"},"You should now be able to server render components with Griffel styles on any of your pages:")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-js"},"import { makeStyles } from '@griffel/react';\n\nconst useClasses = makeStyles({\n  button: { fontWeight: 'bold' },\n});\n\nexport default function Home() {\n  const classes = useClasses();\n\n  return <Button className={classes.button}>Hello world!</Button>;\n}\n")))}g.isMDXComponent=!0}}]);