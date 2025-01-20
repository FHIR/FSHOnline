import path from 'path';
import { DiskBasedVirtualPackage } from 'fhir-package-loader';

export async function loadTestDefinitions(defs) {
  await defs.loadVirtualPackage(
    new DiskBasedVirtualPackage(
      { name: 'fsh-online-test-defs', version: '1.0.0' },
      [path.join(__dirname, 'testdefs')],
      {
        log: () => {},
        allowNonResources: true, // support for logical instances
        recursive: true
      }
    )
  );
}
