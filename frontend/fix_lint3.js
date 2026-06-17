import fs from 'fs';

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const r of replacements) {
    content = content.replace(r.search, r.replace);
  }
  fs.writeFileSync(path, content);
}

replaceInFile('src/pages/Admin/Moderation.jsx', [
  { search: /} catch {/g, replace: '} catch (err) {' }
]);

replaceInFile('src/pages/Dashboard/Home.jsx', [
  { search: /} catch {/g, replace: '} catch (err) {' }
]);

console.log('Fixed final lint errors');
