// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_daffy_yellow_claw.sql';
import m0001 from './0001_sharp_zemo.sql';
import m0002 from './0002_opposite_scream.sql';
import m0003 from './0003_aspiring_clint_barton.sql';
import m0004 from './0004_colossal_forgotten_one.sql';
import m0005 from './0005_add_product_unit.sql';
import m0006 from './0006_add_schedule_pause.sql';
import m0007 from './0007_repair_schedule_interval_and_quantity.sql';
import m0008 from './0008_add_product_pack_size.sql';
import m0009 from './0009_add_product_images.sql';
import m0010 from './0010_add_product_fasting.sql';
import m0011 from './0011_add_product_profile_image.sql';
import m0012 from './0012_price_as_text.sql';
import m0013 from './0013_add_as_needed_intakes.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006,
m0007,
m0008,
m0009,
m0010,
m0011,
m0012,
m0013
    }
  }
  