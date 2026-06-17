import fs from 'fs';

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const r of replacements) {
    content = content.replace(r.search, r.replace);
  }
  fs.writeFileSync(path, content);
}

replaceInFile('src/pages/Dashboard/BiolinkEditor.jsx', [
  { search: /const { user } = useAuth\(\);\n/g, replace: '' },
  { search: /const \[biolink, setBiolink\] = useState\(null\);\n/g, replace: '' },
  { search: /const \[workspaces, setWorkspaces\] = useState\(\[\]\);\n/g, replace: '' },
  { search: /const \[theme, setTheme\] = useState/g, replace: 'const [theme] = useState' },
  { search: /} catch \(err\) {/g, replace: '} catch {' },
  { search: /useEffect\(\(\) => {\n {4}fetchWorkspaces\(\);\n/g, replace: 'const fetchWorkspaces = async () => {\n    try {\n      const res = await api.get(\'/workspaces\');\n      if (res.data.length > 0) setWorkspaceId(res.data[0]._id);\n    } catch {\n      toast.error(\'Failed to load workspaces\');\n    }\n  };\n\n  useEffect(() => {\n    fetchWorkspaces();\n' },
  { search: /const fetchWorkspaces = async \(\) => {[\s\S]*?};\n/g, replace: '' }
]);

replaceInFile('src/pages/Admin/Moderation.jsx', [
  { search: /} catch \(error\) {/g, replace: '} catch {' }
]);

replaceInFile('src/pages/Dashboard/DeveloperPortal.jsx', [
  { search: /} catch \(err\) {/g, replace: '} catch {' },
  { search: /useEffect\(\(\) => {\n {4}fetchKeys\(\);\n/g, replace: 'const fetchKeys = async () => {\n    try {\n      const res = await api.get(\'/keys\');\n      setKeys(res.data);\n    } catch {\n      toast.error(\'Failed to fetch API keys\');\n    }\n  };\n\n  useEffect(() => {\n    fetchKeys();\n' },
  { search: /const fetchKeys = async \(\) => {[\s\S]*?};\n/g, replace: '' }
]);

replaceInFile('src/pages/Dashboard/Home.jsx', [
  { search: /} catch \(err\) {/g, replace: '} catch {' }
]);

replaceInFile('src/pages/Dashboard/MyLinks.jsx', [
  { search: /const { user } = useAuth\(\);\n/g, replace: '' }
]);

replaceInFile('src/pages/Dashboard/WebhookAudit.jsx', [
  { search: /const { user } = useAuth\(\);\n/g, replace: '' }
]);

replaceInFile('src/pages/Dashboard/WorkspaceSettings.jsx', [
  { search: /} catch \(err\) {/g, replace: '} catch {' },
  { search: /useEffect\(\(\) => {\n {4}fetchWorkspaces\(\);\n/g, replace: 'const fetchWorkspaces = async () => {\n    try {\n      const res = await api.get(\'/workspaces\');\n      setWorkspaces(res.data);\n    } catch {\n      toast.error(\'Failed to load workspaces\');\n    }\n  };\n\n  useEffect(() => {\n    fetchWorkspaces();\n' },
  { search: /const fetchWorkspaces = async \(\) => {[\s\S]*?};\n/g, replace: '' }
]);

replaceInFile('src/pages/LandingPage.jsx', [
  { search: /import React, { useState, useEffect, useRef } from 'react';/, replace: "import React, { useState } from 'react';" },
  { search: /const FeatureCard = \({ title, description, Icon, color }\) => \(/, replace: "const FeatureCard = ({ title, description, color }) => (" }
]);

replaceInFile('src/pages/Public/BiolinkView.jsx', [
  { search: /} catch \(err\) {/g, replace: '} catch {' }
]);

replaceInFile('src/utils/validators.js', [
  { search: /\.catch\(_ => false\)/, replace: '.catch(() => false)' }
]);

console.log('Fixed simple lint errors');
