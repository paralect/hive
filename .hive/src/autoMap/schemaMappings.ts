import fs from 'fs';

let schemaMappings = {};

if (fs.existsSync('./schemaMappings.json')) {
  schemaMappings = JSON.parse(fs.readFileSync('./schemaMappings.json', 'utf8') || '{}');
}

if (process.env.HIVE_SRC && fs.existsSync(`${process.env.HIVE_SRC}/autoMap/schemaMappings.json`)) {
  schemaMappings = JSON.parse(fs.readFileSync(`${process.env.HIVE_SRC}/autoMap/schemaMappings.json`, 'utf8') || '{}');
}

export default schemaMappings;