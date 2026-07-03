import { h } from 'preact';

import { usePage } from './context/PageContext';
import { ActionSelectPage } from './pages/ActionSelectPage';
import { ExportAsSpriteSheet } from './pages/ExportAsSpriteSheetPage';
import { ExportAsGodotScene } from './pages/ExportAsGodotScene';

export default function MainRouter() {
  const { currentPage } = usePage();
 
  const pages = {
    'action': <ActionSelectPage/>,
    'export': <ExportAsSpriteSheet/>,
    'export-godot-scene': <ExportAsGodotScene/>
  };
  return pages[currentPage] || <ActionSelectPage/>

}