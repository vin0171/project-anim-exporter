import {
  render,
} from '@create-figma-plugin/ui'

import { h } from 'preact'
import { PageProvider } from './context/PageContext'
import Router from './Router'
import { NodeProvider } from './context/NodeContext'

function Plugin() {
    return (
      <PageProvider>
        <NodeProvider>
          <Router/>
        </NodeProvider>
      </PageProvider>
    );
}

export default render(Plugin)