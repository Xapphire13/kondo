import React, { useState, useEffect } from 'react';
import path from 'path';
import { ipcRenderer } from 'electron'; // eslint-disable-line
import fs from 'fs';
import { promisify } from 'util';
import { KondoDirectory } from '../test';
import FolderVisualization from './FolderVisualization';
import Breadcrumbs from './Breadcrumbs';
import { withStyles, WithStylesProps } from './themes/withStyles';

const readFile = promisify(fs.readFile);
const generateNew = false;

type AppProps = WithStylesProps;

export function BareApp({ css, styles }: AppProps) {
  const [selectedDir, setSelectedDir] = useState<KondoDirectory>();
  const [dirPath, setDirPath] = useState<string>('/');

  const onDirectorySelected = (newDir: KondoDirectory, newDirPath: string) => {
    setSelectedDir(newDir);
    setDirPath(newDirPath);
  };

  useEffect(() => {
    async function LoadScanResults() {
      let cachedPath = path.join(process.env.HOME || '', 'kondo-backup');

      if (generateNew || !cachedPath) {
        const scanResultsPath = new Promise<string>(res => {
          ipcRenderer.once('scan-complete', (_ev: any, args: any) => res(args));
        });
        ipcRenderer.send('scan-disk');

        cachedPath = await scanResultsPath;
      }

      const rootDirectory: KondoDirectory = JSON.parse(
        await readFile(cachedPath, { encoding: 'utf8' })
      );

      setSelectedDir(rootDirectory);
    }

    if (!selectedDir) {
      LoadScanResults();
    }
  });

  return (
    <div {...css(styles.app)}>
      {dirPath && <Breadcrumbs path={dirPath} onSelect={() => {}} />}
      {selectedDir && (
        <FolderVisualization
          directory={selectedDir}
          onDirectorySelected={onDirectorySelected}
          dirPath={dirPath}
        />
      )}
    </div>
  );
}

export default withStyles(({ color }) => ({
  app: {
    background: color.darkGray,
    width: '100%',
    height: '100%'
  }
}))(BareApp);