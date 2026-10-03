// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_daffy_yellow_claw.sql';
import m0001 from './0001_sharp_zemo.sql';
import m0002 from './0002_opposite_scream.sql';
import m0003 from './0003_aspiring_clint_barton.sql';
import m0004 from './0004_colossal_forgotten_one.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
  },
};
