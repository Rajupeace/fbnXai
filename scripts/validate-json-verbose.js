const fs = require('fs');
const path = require('path');

function walk(dir){
  const entries = fs.readdirSync(dir);
  for(const name of entries){
    const p = path.join(dir, name);
    let stat;
    try{ stat = fs.statSync(p); } catch(e){ continue; }
    if(stat.isDirectory()){
      if(p.includes('node_modules') || p.includes(path.sep + 'build')) continue;
      walk(p);
    } else if(p.endsWith('.json')){
      try{
        const content = fs.readFileSync(p,'utf8');
        try {
          JSON.parse(content);
        } catch(e) {
          console.error('PARSE_ERROR =>', p, e.message);
        }
      } catch(e) {
        console.error('READ_ERROR =>', p, e.message);
      }
    }
  }
}

walk(process.cwd());
console.log('Done');
