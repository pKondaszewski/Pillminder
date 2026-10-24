const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');

const RULES_NAME = 'data_extraction_rules';

// Photos stay out of the cloud backup so the database always fits the quota;
// the folder name must match `product-images` in src/images/image-files.ts.
const DATA_EXTRACTION_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
    <exclude domain="file" path="product-images"/>
  </cloud-backup>
</data-extraction-rules>
`;

function withBackupRules(config) {
  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const resFolder = await AndroidConfig.Paths.getResourceFolderAsync(
        modConfig.modRequest.projectRoot,
      );
      const xmlFolder = path.join(resFolder, 'xml');
      fs.mkdirSync(xmlFolder, { recursive: true });
      fs.writeFileSync(
        path.join(xmlFolder, `${RULES_NAME}.xml`),
        DATA_EXTRACTION_RULES_XML,
      );
      return modConfig;
    },
  ]);
  return withAndroidManifest(config, (modConfig) => {
    AndroidConfig.Manifest.getMainApplicationOrThrow(modConfig.modResults).$[
      'android:dataExtractionRules'
    ] = `@xml/${RULES_NAME}`;
    return modConfig;
  });
}

module.exports = withBackupRules;
