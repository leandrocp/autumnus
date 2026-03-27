import MDXComponents from '@theme-original/MDXComponents'

export default {
  ...MDXComponents,
  pre: (props) => <pre {...props} />,
  code: (props) => <code {...props} />,
}
