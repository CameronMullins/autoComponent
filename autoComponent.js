const fs = require("fs")
const chalk = require('chalk')

const templates = {
  index: name => `export {default} from './${name}'
`,
  comp: name => `// @flow
// Styles
import styled from 'styled-components'

// Core
import React from 'react'

// Components, services, constants

// 3rd party
import classnames from 'classnames'

type Props = {
  className?: string
}

const ${name} = ({className}: Props) => {
  return(
    <${name}.Styled className={classnames('${convertToKebab(name)}', className)}>
    
    </${name}.Styled>
  )
}

${name}.Styled = styled.div\`

\`

export default ${name}
`,
  story: name => `import React from 'react'
import ${name} from './${name}'

import styled from 'styled-components'

export default {
  component: ${name},
  title: '${name}',
  excludeStories: /.*Data$/
}

export const Default = () => {
  return <${name}.styled />
}

${name}.styled = styled(${name})\`
  margin: auto;
\`
`
};

const fileExists = path => file => fs.existsSync(`${path}/${file}`);

const convertToKebab = (string) => {
  return string
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
          .toLowerCase();;
};

const writeToPath = path => (file, content) => {
  const filePath = `${path}/${file}`;

  fs.writeFile(filePath, content, err => {
    if (err) throw err;
    console.log("Created file: ", filePath);
    return true;
  });
};

function createFiles(path, name) {
  const files = {
    index: "index.js",
    story: `${name}.stories.js`,
    comp: `${name}.js`
  };
  

  if (name !== "components") {
    const writeFile = writeToPath(path);
    const toFileMissingBool = file => !fileExists(path)(file);
    const checkAllMissing = (acc, cur) => acc && cur;

    const noneExist = Object.values(files)
      .map(toFileMissingBool)
      .reduce(checkAllMissing);

    if (noneExist) {
      console.log(`Generating new Component: ${name}
             at Location: ${path}
      `);
      Object.entries(files).forEach(([type, fileName]) => {
        writeFile(fileName, templates[type](name));
      });
    }
  }
}

const makeComponent = () => {
  const projectName = process.env.PWD
  const componentName = process.argv[2]
  
  if (!fs.existsSync(`${projectName}/src/components/${componentName}`)){
    fs.mkdirSync(`${projectName}/src/components/${componentName}`)
    createFiles(`${projectName}/src/components/${componentName}`, componentName)
  } else {
    console.log(chalk.red('Component Already Exists'))
  }
}

module.exports = {start: makeComponent}

